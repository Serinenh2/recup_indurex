from rest_framework import viewsets, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from apps.accounts.permissions import ModulePermission, IsSuperAdmin
from .models import AdministrationEnvironnement, Department, Service, Unit, Employee
from .serializers import (
    AdministrationSerializer,
    DepartmentSerializer, DepartmentTreeSerializer,
    ServiceSerializer, ServiceFlatSerializer,
    UnitSerializer, EmployeeSerializer,
)


class AdministrationViewSet(viewsets.ModelViewSet):
    module_label     = 'administration'
    permission_classes = [ModulePermission]
    queryset         = AdministrationEnvironnement.objects.all()
    serializer_class = AdministrationSerializer
    filter_backends  = [filters.SearchFilter, DjangoFilterBackend]
    search_fields    = ['denomination','nom_directeur','email']
    filterset_fields = ['type_administration','statut','wilaya']


# ── Organization Management ─────────────────────────────────────────────────────

class DepartmentViewSet(viewsets.ModelViewSet):
    module_label      = 'administration'
    permission_classes = [ModulePermission]
    queryset          = Department.objects.all()
    serializer_class  = DepartmentSerializer
    filter_backends   = [filters.SearchFilter]
    search_fields     = ['name', 'code', 'head']


class ServiceViewSet(viewsets.ModelViewSet):
    module_label      = 'administration'
    permission_classes = [ModulePermission]
    queryset          = Service.objects.select_related('department').all()
    serializer_class  = ServiceSerializer
    filter_backends   = [filters.SearchFilter, DjangoFilterBackend]
    search_fields     = ['name', 'code', 'head']
    filterset_fields  = ['department']


class UnitViewSet(viewsets.ModelViewSet):
    module_label      = 'administration'
    permission_classes = [ModulePermission]
    queryset          = Unit.objects.select_related('service', 'service__department').all()
    serializer_class  = UnitSerializer
    filter_backends   = [filters.SearchFilter, DjangoFilterBackend]
    search_fields     = ['name', 'code', 'head']
    filterset_fields  = ['service', 'service__department']


class EmployeeViewSet(viewsets.ModelViewSet):
    module_label      = 'administration'
    permission_classes = [ModulePermission]
    queryset          = Employee.objects.select_related('unit', 'unit__service', 'unit__service__department').all()
    serializer_class  = EmployeeSerializer
    filter_backends   = [filters.SearchFilter, DjangoFilterBackend]
    search_fields     = ['first_name', 'last_name', 'email', 'position']
    filterset_fields  = ['unit', 'unit__service', 'unit__service__department']


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def organization_tree(request):
    """Return the full org tree: departments → services → units → employees."""
    departments = Department.objects.prefetch_related(
        'services__units__employees'
    ).filter(is_active=True)

    tree = []
    for dept in departments:
        services = []
        for svc in dept.services.filter(is_active=True):
            units = []
            for unit in svc.units.filter(is_active=True):
                employees = [
                    {
                        'id': e.id,
                        'first_name': e.first_name,
                        'last_name': e.last_name,
                        'full_name': e.full_name,
                        'position': e.position,
                        'email': e.email,
                        'phone': e.phone,
                    }
                    for e in unit.employees.filter(is_active=True)
                ]
                units.append({
                    'id': unit.id,
                    'name': unit.name,
                    'code': unit.code,
                    'head': unit.head,
                    'employee_count': len(employees),
                    'employees': employees,
                })
            services.append({
                'id': svc.id,
                'name': svc.name,
                'code': svc.code,
                'head': svc.head,
                'unit_count': len(units),
                'employee_count': sum(u['employee_count'] for u in units),
                'units': units,
            })
        tree.append({
            'id': dept.id,
            'name': dept.name,
            'code': dept.code,
            'head': dept.head,
            'service_count': len(services),
            'unit_count': sum(s['unit_count'] for s in services),
            'employee_count': sum(s['employee_count'] for s in services),
            'services': services,
        })

    return Response(tree)