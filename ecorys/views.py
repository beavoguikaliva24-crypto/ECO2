from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import *
from .serializers import *

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