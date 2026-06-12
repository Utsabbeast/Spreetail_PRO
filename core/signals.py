from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum
from .models import Expense, ExpenseSplit, Settlement, UserBalance, GroupMember

def recalculate_balance(user, group):
    # Total paid by user in expenses
    paid_expenses = Expense.objects.filter(group=group, paid_by=user).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    # Total split owed by user
    split_owed = ExpenseSplit.objects.filter(expense__group=group, user=user).aggregate(Sum('amount_owed'))['amount_owed__sum'] or 0
    
    # Total settlements paid by user
    settlements_paid = Settlement.objects.filter(group=group, payer=user).aggregate(Sum('amount'))['amount__sum'] or 0
    # Total settlements received by user
    settlements_received = Settlement.objects.filter(group=group, payee=user).aggregate(Sum('amount'))['amount__sum'] or 0
    
    net = paid_expenses - split_owed + settlements_paid - settlements_received
    
    UserBalance.objects.update_or_create(
        user=user, group=group,
        defaults={'net_balance': net}
    )

@receiver([post_save, post_delete], sender=Expense)
def update_expense_balance(sender, instance, **kwargs):
    recalculate_balance(instance.paid_by, instance.group)

@receiver([post_save, post_delete], sender=ExpenseSplit)
def update_split_balance(sender, instance, **kwargs):
    recalculate_balance(instance.user, instance.expense.group)
    recalculate_balance(instance.expense.paid_by, instance.expense.group)

@receiver([post_save, post_delete], sender=Settlement)
def update_settlement_balance(sender, instance, **kwargs):
    recalculate_balance(instance.payer, instance.group)
    recalculate_balance(instance.payee, instance.group)

@receiver(post_save, sender=GroupMember)
def init_user_balance(sender, instance, **kwargs):
    UserBalance.objects.get_or_create(user=instance.user, group=instance.group)
