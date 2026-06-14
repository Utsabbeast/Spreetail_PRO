from django.contrib import admin
from django.urls import path
from core import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.dashboard, name='dashboard'),
    path('login/', views.login_page, name='login_page'),
    path('register/', views.register_page, name='register_page'),
    path('api/register/', views.register_view),
    path('api/set-password/', views.set_password_api),
    path('api/login/', views.login_view),
    path('api/logout/', views.logout_view),
    path('set-password/<str:uidb64>/<str:token>/', views.set_password_page, name='set_password_page'),
    path('api/groups/', views.group_list),
    path('api/groups/<int:group_id>/members/', views.group_members),
    path('api/groups/<int:group_id>/expenses/', views.expense_list),
    path('api/groups/<int:group_id>/balances/', views.balances),
    path('api/groups/<int:group_id>/settle/', views.settle_up),
    path('api/expenses/<int:expense_id>/chat/', views.expense_chat),
    path('api/groups/<int:group_id>/import/', views.import_csv),
    path('api/groups/<int:group_id>/import/confirm/', views.confirm_import),
    path('api/invitations/', views.user_invitations),
    path('api/invitations/<int:invite_id>/<str:action>/', views.handle_invitation),
]
