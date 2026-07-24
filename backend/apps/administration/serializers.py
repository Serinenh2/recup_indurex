from rest_framework import serializers
from .models import AdministrationEnvironnement, Department, Service, Unit, Employee


class AdministrationSerializer(serializers.ModelSerializer):
    type_display   = serializers.CharField(source='get_type_administration_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    class Meta:
        model  = AdministrationEnvironnement
        fields = '__all__'


# ── Organization serializers ─────────────────────────────────────────────────────

class EmployeeSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    unit_name = serializers.CharField(source='unit.name', read_only=True)
    service_name = serializers.CharField(source='unit.service.name', read_only=True)
    department_name = serializers.CharField(source='unit.service.department.name', read_only=True)

    class Meta:
        model  = Employee
        fields = '__all__'


class UnitSerializer(serializers.ModelSerializer):
    employees     = EmployeeSerializer(many=True, read_only=True)
    employee_count = serializers.IntegerField(source='employees.count', read_only=True)
    service_name  = serializers.CharField(source='service.name', read_only=True)
    department_name = serializers.CharField(source='service.department.name', read_only=True)

    class Meta:
        model  = Unit
        fields = '__all__'


class ServiceSerializer(serializers.ModelSerializer):
    units       = UnitSerializer(many=True, read_only=True)
    unit_count  = serializers.SerializerMethodField()
    employee_count = serializers.SerializerMethodField()
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model  = Service
        fields = '__all__'

    def get_unit_count(self, obj):
        return obj.units.count()

    def get_employee_count(self, obj):
        return Employee.objects.filter(unit__service=obj).count()


class ServiceFlatSerializer(serializers.ModelSerializer):
    unit_count     = serializers.IntegerField(read_only=True)
    employee_count = serializers.IntegerField(read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model  = Service
        fields = '__all__'


class DepartmentSerializer(serializers.ModelSerializer):
    services       = ServiceFlatSerializer(many=True, read_only=True)
    service_count  = serializers.SerializerMethodField()
    unit_count     = serializers.SerializerMethodField()
    employee_count = serializers.SerializerMethodField()

    class Meta:
        model  = Department
        fields = '__all__'

    def get_service_count(self, obj):
        return obj.services.count()

    def get_unit_count(self, obj):
        return Unit.objects.filter(service__department=obj).count()

    def get_employee_count(self, obj):
        return Employee.objects.filter(unit__service__department=obj).count()


class DepartmentTreeSerializer(serializers.ModelSerializer):
    """Lightweight tree serializer — no nested units/employees to keep payload small."""
    service_count  = serializers.IntegerField(read_only=True)
    unit_count     = serializers.IntegerField(read_only=True)
    employee_count = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Department
        fields = '__all__'