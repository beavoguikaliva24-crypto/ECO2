from rest_framework import viewsets, filters,status
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import *
from .serializers import *
from rest_framework_simplejwt.tokens import RefreshToken

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        try:
            # Recherche de l'utilisateur
            user = TableUtilisateur.objects.get(username=username, password=password)
            
            if user.statut == 'Off':
                return Response({"error": "Compte inactif"}, status=status.HTTP_403_FORBIDDEN)

            # Génération manuelle du Token JWT
            refresh = RefreshToken.for_user(user)

            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "username": user.username,
                    "nom": user.nom,
                    "prenom": user.prenom,
                    "role": user.role.role if user.role else "Utilisateur"
                }
            }, status=status.HTTP_200_OK)

        except TableUtilisateur.DoesNotExist:
            return Response({"error": "Identifiants incorrects"}, status=status.HTTP_401_UNAUTHORIZED)

# Utilisation de ModelViewSet pour gérer automatiquement le CRUD
class AnneeViewSet(viewsets.ModelViewSet):
    queryset = TableAnnee.objects.all()
    serializer_class = AnneeSerializer

class NiveauViewSet(viewsets.ModelViewSet):
    queryset = TableNiveau.objects.all()
    serializer_class = NiveauSerializer

class OptionViewSet(viewsets.ModelViewSet):
    queryset = TableOption.objects.all()
    serializer_class = OptionSerializer

class RoleViewSet(viewsets.ModelViewSet):
    queryset = TableRole.objects.all()
    serializer_class = RoleSerializer

class PermissionViewSet(viewsets.ModelViewSet):
    queryset = TablePermission.objects.all()
    serializer_class = PermissionSerializer

class UtilisateurViewSet(viewsets.ModelViewSet):
    queryset = TableUtilisateur.objects.all()
    serializer_class = UtilisateurSerializer

class EleveViewSet(viewsets.ModelViewSet):
    queryset = TableEleve.objects.all()
    serializer_class = EleveSerializer
    # Ajout de recherche par nom ou matricule
    filter_backends = [filters.SearchFilter]
    # 2. On définit les champs sur lesquels on peut chercher
    # Le '^' signifie "commence par", le '@' est pour la recherche plein texte
    search_fields = ['fullname', 'matricule']

class ClasseViewSet(viewsets.ModelViewSet):
    queryset = TableClasse.objects.all()
    serializer_class = ClasseSerializer
    search_fields = ['code_classe', 'lib_classe']

class FraisScolariteViewSet(viewsets.ModelViewSet):
    queryset = TableFraisScolarite.objects.all()
    serializer_class = FraisScolariteSerializer

class AffectationViewSet(viewsets.ModelViewSet):
    queryset = TableAffectation.objects.all()
    serializer_class = AffectationSerializer
    # Filtrer les élèves par classe ou année
    filter_backends = [DjangoFilterBackend]
    filterset_fields = [ 'annee_aff', 'classe_aff']

class RecouvrementViewSet(viewsets.ModelViewSet):
    queryset = TableRecouvrement.objects.all()
    serializer_class = RecouvrementSerializer