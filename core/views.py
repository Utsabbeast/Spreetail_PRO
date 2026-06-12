import json
import re
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from .models import Group, GroupMember, Expense, ExpenseSplit, Settlement, UserBalance, ExpenseMessage
from django.db import transaction

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.shortcuts import render
from django.contrib.sessions.models import Session
from django.utils import timezone

@csrf_exempt
def register_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        
        if not username or not email:
            return JsonResponse({'status': 'error', 'message': 'Missing fields'}, status=400)
            
        if len(username) < 3:
            return JsonResponse({'status': 'error', 'message': 'Username must be at least 3 characters.'}, status=400)
            
        if '@' not in email or '.' not in email:
            return JsonResponse({'status': 'error', 'message': 'Invalid email address.'}, status=400)
            
        existing_username = User.objects.filter(username=username).first()
        if existing_username:
            if existing_username.is_active:
                return JsonResponse({'status': 'error', 'message': 'Username taken.'}, status=400)
            else:
                existing_username.delete()

        existing_email = User.objects.filter(email=email).first()
        if existing_email:
            if existing_email.is_active:
                return JsonResponse({'status': 'error', 'message': 'Email already registered.'}, status=400)
            else:
                existing_email.delete()
            
        user = User.objects.create_user(username=username, email=email)
        user.set_unusable_password()
        user.is_active = False
        user.save()
        
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"http://127.0.0.1:8000/set-password/{uid}/{token}/"
        
        send_mail(
            'Set Your Splitwise Password',
            f'Welcome {username}! Click here to set your password and activate your account:\n{reset_link}',
            'noreply@splitwiseclone.local',
            [email],
            fail_silently=False,
        )
        
        return JsonResponse({
            'status': 'success', 
            'message': 'Registration successful! Check console for link.',
            'reset_link': reset_link
        })

@csrf_exempt
def set_password_api(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        uidb64 = data.get('uid')
        token = data.get('token')
        password = data.get('password')
        
        if len(password) < 8:
            return JsonResponse({'status': 'error', 'message': 'Password must be at least 8 characters.'}, status=400)
        if not re.search(r'[A-Za-z]', password) or not re.search(r'\d', password):
            return JsonResponse({'status': 'error', 'message': 'Password must contain letters and numbers.'}, status=400)
            
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None
            
        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(password)
            user.is_active = True
            user.save()
            login(request, user)
            return JsonResponse({'status': 'success'})
        else:
            return JsonResponse({'status': 'error', 'message': 'Invalid or expired link.'}, status=400)

def set_password_page(request, uidb64, token):
    return render(request, 'set_password.html', {'uid': uidb64, 'token': token})

@login_required
@csrf_exempt
def user_invitations(request):
    if request.method == 'GET':
        invites = GroupInvitation.objects.filter(user=request.user).order_by('-created_at')
        data = []
        for i in invites:
            data.append({
                'id': i.id,
                'group_name': i.group.name,
                'invited_by': f"{i.invited_by.username}#{i.invited_by.id}",
                'created_at': i.created_at.isoformat()
            })
        return JsonResponse({'invitations': data})

@login_required
@csrf_exempt
def handle_invitation(request, invite_id, action):
    if request.method == 'POST':
        try:
            invite = GroupInvitation.objects.get(id=invite_id, user=request.user)
        except GroupInvitation.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Invitation not found.'}, status=404)
            
        if action == 'accept':
            if not GroupMember.objects.filter(group=invite.group, user=request.user).exists():
                GroupMember.objects.create(group=invite.group, user=request.user)
            invite.delete()
            return JsonResponse({'status': 'success', 'message': 'Joined group!'})
        elif action == 'deny':
            invite.delete()
            return JsonResponse({'status': 'success', 'message': 'Invitation declined.'})
        return JsonResponse({'status': 'error', 'message': 'Invalid action.'}, status=400)

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user = authenticate(request, username=data['username'], password=data['password'])
        if user is not None:
            login(request, user)
            
            # Enforce single device login
            for session in Session.objects.filter(expire_date__gte=timezone.now()):
                session_data = session.get_decoded()
                if session_data.get('_auth_user_id') == str(user.id):
                    if session.session_key != request.session.session_key:
                        session.delete()
                        
            return JsonResponse({'status': 'success', 'user_id': user.id})
        return JsonResponse({'status': 'error', 'message': 'Invalid credentials'}, status=401)

@csrf_exempt
def logout_view(request):
    logout(request)
    return JsonResponse({'status': 'success'})

@login_required
@csrf_exempt
def group_list(request):
    if request.method == 'GET':
        groups = request.user.group_set.all()
        return JsonResponse({'groups': [{'id': g.id, 'name': g.name} for g in groups]})
    elif request.method == 'POST':
        data = json.loads(request.body)
        group = Group.objects.create(name=data['name'])
        GroupMember.objects.create(group=group, user=request.user)
        return JsonResponse({'status': 'success', 'group_id': group.id})

@login_required
@csrf_exempt
def group_members(request, group_id):
    group = Group.objects.get(id=group_id)
    if request.method == 'GET':
        members = group.members.all()
        return JsonResponse({'members': [{'id': m.id, 'username': m.username} for m in members]})
    elif request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        seq = data.get('sequence_number')
        
        if not username or not seq:
            return JsonResponse({'status': 'error', 'message': 'Username and Sequence Number are required.'}, status=400)
            
        try:
            user = User.objects.get(username=username, id=seq)
        except (ValueError, User.DoesNotExist):
            return JsonResponse({'status': 'error', 'message': 'Exact user not found. Check the details.'}, status=404)
            
        if GroupMember.objects.filter(group=group, user=user).exists():
            return JsonResponse({'status': 'error', 'message': 'User already in group.'}, status=400)
            
        if GroupInvitation.objects.filter(group=group, user=user).exists():
            return JsonResponse({'status': 'error', 'message': 'Invitation already sent.'}, status=400)
            
        GroupInvitation.objects.create(group=group, user=user, invited_by=request.user)
        return JsonResponse({'status': 'success', 'message': 'Invitation sent!'})
    elif request.method == 'DELETE':
        data = json.loads(request.body)
        user_id = data.get('user_id')
        GroupMember.objects.filter(group=group, user_id=user_id).delete()
        return JsonResponse({'status': 'success'})

@login_required
@csrf_exempt
@transaction.atomic
def expense_list(request, group_id):
    group = Group.objects.get(id=group_id)
    if request.method == 'GET':
        expenses = group.expenses.all().order_by('-created_at')
        data = []
        for e in expenses:
            data.append({
                'id': e.id, 'description': e.description, 'total_amount': float(e.total_amount),
                'paid_by': e.paid_by.username, 'created_at': e.created_at.isoformat()
            })
        return JsonResponse({'expenses': data})
    elif request.method == 'POST':
        data = json.loads(request.body)
        paid_by = User.objects.get(id=data['paid_by_id'])
        expense = Expense.objects.create(
            group=group, description=data['description'], 
            total_amount=data['total_amount'], paid_by=paid_by
        )
        for split in data['splits']:
            user = User.objects.get(id=split['user_id'])
            ExpenseSplit.objects.create(expense=expense, user=user, amount_owed=split['amount_owed'])
        return JsonResponse({'status': 'success', 'expense_id': expense.id})

@login_required
@csrf_exempt
def balances(request, group_id):
    group = Group.objects.get(id=group_id)
    bals = UserBalance.objects.filter(group=group)
    return JsonResponse({'balances': [{'user_id': b.user.id, 'username': b.user.username, 'net_balance': float(b.net_balance)} for b in bals]})

@login_required
@csrf_exempt
def settle_up(request, group_id):
    if request.method == 'POST':
        data = json.loads(request.body)
        payee = User.objects.get(id=data['payee_id'])
        group = Group.objects.get(id=group_id)
        Settlement.objects.create(
            group=group, payer=request.user, payee=payee, amount=data['amount']
        )
        return JsonResponse({'status': 'success'})

@login_required
@csrf_exempt
def expense_chat(request, expense_id):
    expense = Expense.objects.get(id=expense_id)
    if request.method == 'GET':
        messages = expense.messages.all().order_by('created_at')
        return JsonResponse({'messages': [{'user': m.user.username, 'message': m.message, 'created_at': m.created_at.isoformat()} for m in messages]})
    elif request.method == 'POST':
        data = json.loads(request.body)
        ExpenseMessage.objects.create(expense=expense, user=request.user, message=data['message'])
        return JsonResponse({'status': 'success'})

@login_required
def dashboard(request):
    from django.shortcuts import render
    return render(request, 'dashboard.html')

def login_page(request):
    from django.shortcuts import render
    return render(request, 'login.html')

def register_page(request):
    from django.shortcuts import render
    return render(request, 'register.html')
