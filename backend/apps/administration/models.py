from django.db import models

class AdministrationEnvironnement(models.Model):
    TYPE_CHOICES = [
        ('MINISTERE',  "Ministère de l'Environnement et de la Qualité de la Vie"),
        ('DIR_WILAYA', "Direction de l'Environnement de Wilaya"),
        ('AND',        "Agence Nationale des Déchets (AND)"),
    ]
    STATUT_CHOICES = [
        ('ACTIF',    'Actif'),
        ('INACTIF',  'Inactif'),
        ('SUSPENDU', 'Suspendu'),
    ]

    type_administration     = models.CharField(max_length=20, choices=TYPE_CHOICES)
    denomination            = models.CharField(max_length=300)
    wilaya                  = models.CharField(max_length=3, blank=True)
    commune                 = models.CharField(max_length=200, blank=True)
    adresse                 = models.TextField(blank=True)
    telephone               = models.CharField(max_length=30, blank=True)
    fax                     = models.CharField(max_length=30, blank=True)
    email                   = models.EmailField(blank=True)
    site_web                = models.URLField(blank=True)
    nom_directeur           = models.CharField(max_length=200, blank=True)
    telephone_directeur     = models.CharField(max_length=30, blank=True)
    email_directeur         = models.EmailField(blank=True)
    numero_agrement_delivre = models.CharField(max_length=100, blank=True)
    latitude                = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude               = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    statut                  = models.CharField(max_length=15, choices=STATUT_CHOICES, default='ACTIF')
    notes                   = models.TextField(blank=True)
    created_at              = models.DateTimeField(auto_now_add=True)
    updated_at              = models.DateTimeField(auto_now=True)

    class Meta:
        ordering     = ['type_administration', 'wilaya', 'denomination']
        verbose_name = "Administration de l'Environnement"

    def __str__(self):
        w = f" — W.{self.wilaya}" if self.wilaya else ""
        return f"{self.get_type_administration_display()}{w}"


# ── Organization Management ─────────────────────────────────────────────────────

class Department(models.Model):
    name        = models.CharField(max_length=200)
    code        = models.CharField(max_length=20, unique=True, blank=True)
    description = models.TextField(blank=True)
    head        = models.CharField(max_length=200, blank=True)
    email       = models.EmailField(blank=True)
    phone       = models.CharField(max_length=30, blank=True)
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Département'
        verbose_name_plural = 'Départements'

    def __str__(self):
        return self.name


class Service(models.Model):
    department  = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='services')
    name        = models.CharField(max_length=200)
    code        = models.CharField(max_length=20, blank=True)
    description = models.TextField(blank=True)
    head        = models.CharField(max_length=200, blank=True)
    email       = models.EmailField(blank=True)
    phone       = models.CharField(max_length=30, blank=True)
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['department', 'name']
        verbose_name = 'Service'
        verbose_name_plural = 'Services'

    def __str__(self):
        return f"{self.department.name} — {self.name}"


class Unit(models.Model):
    service     = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='units')
    name        = models.CharField(max_length=200)
    code        = models.CharField(max_length=20, blank=True)
    description = models.TextField(blank=True)
    head        = models.CharField(max_length=200, blank=True)
    email       = models.EmailField(blank=True)
    phone       = models.CharField(max_length=30, blank=True)
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['service', 'name']
        verbose_name = 'Unité'
        verbose_name_plural = 'Unités'

    def __str__(self):
        return f"{self.service.department.name} / {self.service.name} — {self.name}"


class Employee(models.Model):
    unit        = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='employees')
    first_name  = models.CharField(max_length=150)
    last_name   = models.CharField(max_length=150)
    position    = models.CharField(max_length=200, blank=True)
    email       = models.EmailField(blank=True)
    phone       = models.CharField(max_length=30, blank=True)
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['unit', 'last_name', 'first_name']
        verbose_name = 'Employé'
        verbose_name_plural = 'Employés'

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"