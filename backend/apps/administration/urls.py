from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdministrationViewSet,
    DepartmentViewSet, ServiceViewSet, UnitViewSet, EmployeeViewSet,
    organization_tree,
)

router = DefaultRouter()
router.register('',             AdministrationViewSet, basename='administration')
router.register('departments',  DepartmentViewSet,     basename='department')
router.register('services',     ServiceViewSet,        basename='service')
router.register('units',        UnitViewSet,           basename='unit')
router.register('employees',    EmployeeViewSet,       basename='employee')

urlpatterns = [
    path('tree/', organization_tree),
    path('', include(router.urls)),
]