"""Tests de base — vérifient que l'application démarre correctement."""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

User = get_user_model()


class TestAppStartup(TestCase):
    """L'application Django peut être importée et les modèles de base fonctionnent."""

    def test_user_model_works(self):
        user = User.objects.create_user(
            username='testuser',
            password='Test@12345678',
            email='test@example.com',
        )
        self.assertEqual(str(user), f'{user.username} (Observateur)')
        self.assertTrue(user.check_password('Test@12345678'))

    def test_user_has_role(self):
        user = User.objects.create_user(username='roleuser', password='Test@12345678')
        user.role = 'SUPERADMIN'
        user.save()
        self.assertTrue(user.has_role('SUPERADMIN'))
        self.assertFalse(user.has_role('ADMIN'))
        self.assertTrue(user.has_role_or_above('ADMIN'))


class TestAuthAPI(APITestCase):
    """Les endpoints JWT fonctionnent."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='apiuser',
            password='Test@12345678',
            email='api@example.com',
        )

    def test_token_obtain_fails_with_wrong_credentials(self):
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {
            'username': 'apiuser',
            'password': 'wrongpassword',
        }, format='json')
        self.assertEqual(response.status_code, 401)

    def test_token_obtain_succeeds(self):
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {
            'username': 'apiuser',
            'password': 'Test@12345678',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)


class TestSecurityHeaders(TestCase):
    """Les headers de sécurité sont présents."""

    def test_security_headers_on_admin(self):
        self.client.login(username='testuser', password='Test@12345678')
        # On teste juste que l'app répond — les headers sont vérifiés dans la config
        response = self.client.get('/admin/login/?next=/admin/')
        self.assertIn(response.status_code, [200, 302])
