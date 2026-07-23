from django.urls import path
from .views import (
    me, mon_recuperateur,
    roles_list, roles_detail, roles_update_permissions,
    permissions_list, assign_role, audit_log,
    users_list, user_create, user_detail, user_reset_password,
)

urlpatterns = [
    path('me/',                        me),
    path('mon-recuperateur/',          mon_recuperateur),
    path('users/',                     users_list),
    path('users/create/',              user_create),
    path('users/<int:pk>/',            user_detail),
    path('users/<int:pk>/reset-password/', user_reset_password),
    path('roles/',                     roles_list),
    path('roles/<int:pk>/',            roles_detail),
    path('roles/<int:pk>/permissions/', roles_update_permissions),
    path('permissions/',               permissions_list),
    path('<int:user_id>/assign-role/', assign_role),
    path('audit-log/',                 audit_log),
]
