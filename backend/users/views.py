from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from djoser.social.views import ProviderAuthView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from .models import UserAccount as User
from rest_framework.permissions import AllowAny  
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import Http404
from rest_framework.permissions import IsAuthenticated
from .models import Organizations, Person, Image
from .serializers import *

class RetrieveUserOrganizations(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            person = Person.objects.get(User=user)
            organizations = Organizations.objects.filter(personorganizationdetails__Person=person)
            organization_serializer = OrganizationsSerializer(organizations, many=True)
            return Response(
                {'organizations': organization_serializer.data},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Person.DoesNotExist:
            return Response(
                {'error': 'Person not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error retrieving organizations: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RetrievePersonView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            person = Person.objects.get(User=user)
            person_serializer = PersonSerializer(person)
            return Response(
                {'person': person_serializer.data},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Person.DoesNotExist:
            return Response(
                {'error': 'Person not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error retrieving person: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        

class ApproveCandidate(APIView):
    permission_classes = [AllowAny]

    def post(self, request, candidate_id):
        try:
            candidate = Candidate.objects.get(id=candidate_id)
            person = candidate.Person
            organization = candidate.Organization

            # Crear PersonOrganizationDetails
            PersonOrganizationDetails.objects.create(Person=person, Organization=organization)

            # Eliminar el candidato
            candidate.delete()

            return Response({'message': 'Candidate approved and added to organization'}, status=status.HTTP_200_OK)
        except Candidate.DoesNotExist:
            return Response({'error': 'Candidate not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RejectCandidate(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, candidate_id):
        try:
            candidate = Candidate.objects.get(id=candidate_id)
            candidate.delete()

            return Response({'message': 'Candidate rejected and deleted'}, status=status.HTTP_200_OK)
        except Candidate.DoesNotExist:
            return Response({'error': 'Candidate not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CandidateDetailView(generics.ListAPIView):

    permission_classes = [AllowAny]
    queryset = Candidate.objects.all()
    serializer_class = CandidateDetailSerializer


class RetrieveImageView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        try:
            user_id = request.query_params.get('user_id')
            if not user_id:
                return Response(
                    {'error': 'User ID is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = User.objects.get(id=user_id)
            images = Image.objects.filter(User=user)

            if images.exists():
                images_serializer = ImageSerializer(images, many=True)
                return Response(
                    {'images': images_serializer.data},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {'error': 'No images found for the specified user'},
                    status=status.HTTP_404_NOT_FOUND
                )
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error retrieving image: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UploadImageView(APIView):

    permission_classes = [AllowAny]
    def post(self, request):
        try:
            data = self.request.data
            user_id = data.get('user_id')                
            user = User.objects.get(id=user_id) 

            image = data['image']
            
            Image.objects.create(
                    image = image,
                    User = user
                )
            
            return Response(
                    {'success': 'Image Uploaded Successfully'},
                    status=status.HTTP_201_CREATED

                )
        except:
            return Response(
                {'error': 'Error Uploading Image'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
                
            )


class CreatePerson(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            data = request.data
            user_id = data.get('user_id')
            user = User.objects.get(id=user_id)
            
            person = Person(
                phone_number=data.get('phone_number'),
                country=data.get('country'),
                description=data.get('description'),
                User=user  # Usuario obtenido por ID
            )
            person.save()

            return Response({'message': 'Person created successfully'}, status=status.HTTP_201_CREATED)

        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CreateOrganization(APIView):
    permission_classes = [AllowAny]  

    def post(self, request):
        try:
            data = request.data
            

            user_id = data.get('user_id')
            if not user_id:
                return Response({'error': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Crear la organización
            organization = Organizations(
                name=data.get('name'),
                description=data.get('description'),
                country=data.get('country'),
                website=data.get('website', ''),
                User=user
            )
            organization.save()

            return Response({'message': 'Organization created successfully'}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# @method_decorator(csrf_exempt, name='dispatch')
class UserTypeUpdate(APIView):
    permission_classes = [AllowAny]  
    def patch(self, request, pk):
        try:
            data = json.loads(request.body)
            user = User.objects.get(pk=pk)
            user_type = data.get('user_type')
            is_completed = data.get('is_completed')

            if user_type is not None:
                user.user_type = user_type 
            if is_completed is not None:
                user.is_completed = is_completed

            user.save()
            return JsonResponse({'message': 'User updated successfully'}, status=200)
        except User.DoesNotExist:
            raise Http404("User not found")
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


class CheckUserType(APIView):
    permission_classes = [AllowAny]  

    def get(self, request, *args, **kwargs):
        user_id = kwargs.get('user_id')
        try:
            user = User.objects.get(id=user_id)
            return Response({'user_type': user.user_type})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)


class CheckCompleteView(APIView):
    permission_classes = [AllowAny]  

    def get(self, request, *args, **kwargs):
        user_id = kwargs.get('user_id')
        try:
            user = User.objects.get(id=user_id)
            return Response({'is_completed': user.is_completed})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

class CustomProviderAuthView(ProviderAuthView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 201:
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')

            response.set_cookie(
                'access',
                access_token,
                max_age=settings.AUTH_COOKIE_MAX_AGE,
                path=settings.AUTH_COOKIE_PATH,
                secure=settings.AUTH_COOKIE_SECURE,
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                samesite=settings.AUTH_COOKIE_SAMESITE
            )
            response.set_cookie(
                'refresh',
                refresh_token,
                max_age=settings.AUTH_COOKIE_MAX_AGE,
                path=settings.AUTH_COOKIE_PATH,
                secure=settings.AUTH_COOKIE_SECURE,
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                samesite=settings.AUTH_COOKIE_SAMESITE
            )

        return response


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')

            response.set_cookie(
                'access',
                access_token,
                max_age=settings.AUTH_COOKIE_MAX_AGE,
                path=settings.AUTH_COOKIE_PATH,
                secure=settings.AUTH_COOKIE_SECURE,
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                samesite=settings.AUTH_COOKIE_SAMESITE
            )
            response.set_cookie(
                'refresh',
                refresh_token,
                max_age=settings.AUTH_COOKIE_MAX_AGE,
                path=settings.AUTH_COOKIE_PATH,
                secure=settings.AUTH_COOKIE_SECURE,
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                samesite=settings.AUTH_COOKIE_SAMESITE
            )

        return response


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh')
        print(refresh_token)
        if refresh_token:
            request.data['refresh'] = refresh_token

        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            access_token = response.data.get('access')

            response.set_cookie(
                'access',
                access_token,
                max_age=settings.AUTH_COOKIE_MAX_AGE,
                path=settings.AUTH_COOKIE_PATH,
                secure=settings.AUTH_COOKIE_SECURE,
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                samesite=settings.AUTH_COOKIE_SAMESITE
            )

        return response


class CustomTokenVerifyView(TokenVerifyView):
    def post(self, request, *args, **kwargs):
        access_token = request.COOKIES.get('access')

        if access_token:
            request.data['token'] = access_token

        return super().post(request, *args, **kwargs)


class LogoutView(APIView): 
    def post(self, request, *args, **kwargs):
        response = Response(status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie('access')
        response.delete_cookie('refresh')

        return response

#-------------------------Inventario---------------------------------------

class OrganizationsListCreate(generics.ListCreateAPIView):
    permission_classes = [AllowAny]

    queryset = Organizations.objects.all()
    serializer_class = OrganizationsSerializer

class OrganizationsRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]

    queryset = Organizations.objects.all()
    serializer_class = OrganizationsSerializer

class HeadquartersListCreate(generics.ListCreateAPIView):
    permission_classes = [AllowAny]

    queryset = Headquarters.objects.all()
    serializer_class = HeadquartersSerializer

class HeadquartersRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]

    queryset = Headquarters.objects.all()
    serializer_class = HeadquartersSerializer

class StatusesListCreate(generics.ListCreateAPIView):
    permission_classes = [AllowAny]

    queryset = Statuses.objects.all()
    serializer_class = StatusSerializer

class StatusesRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]

    queryset = Statuses.objects.all()
    serializer_class = StatusSerializer

class CategoriesListCreate(generics.ListCreateAPIView):
    permission_classes = [AllowAny]

    queryset = Categories.objects.all()
    serializer_class = CategorySerializer

class CategoriesRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]

    queryset = Categories.objects.all()
    serializer_class = CategorySerializer

class ProductsListCreate(generics.ListCreateAPIView):
    permission_classes = [AllowAny]

    queryset = Products.objects.all()
    serializer_class = ProductSerializer

class ProductsRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]

    queryset = Products.objects.all()
    serializer_class = ProductSerializer

class InventoriesListCreate(generics.ListCreateAPIView):
    permission_classes = [AllowAny]

    queryset = Inventories.objects.all()
    serializer_class = InventoriesSerializer

class InventoriesRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]

    queryset = Inventories.objects.all()
    serializer_class = InventoriesSerializer

class ProductInventoryDetailsListCreate(generics.ListCreateAPIView):
    permission_classes = [AllowAny]

    queryset = ProductInventoryDetails.objects.all()
    serializer_class = ProductInventoryDetailsSerializer

class ProductInventoryDetailsRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [AllowAny]

    queryset = ProductInventoryDetails.objects.all()
    serializer_class = ProductInventoryDetailsSerializer

class OrganizationDetailsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            organization = Organizations.objects.get(pk=pk)
        except Organizations.DoesNotExist:
            return Response({"error": "Organization not found"}, status=status.HTTP_404_NOT_FOUND)

        headquarters = Headquarters.objects.filter(Organizations=organization)
        headquarters_serializer = HeadquartersSerializer(headquarters, many=True)

        inventories = Inventories.objects.filter(Headquarters__Organizations=organization)
        inventories_serializer = InventoriesSerializer(inventories, many=True)

        productinventorydetails = ProductInventoryDetails.objects.filter(Inventory__Headquarters__Organizations=organization)
        productinventorydetails_serializer = ProductInventoryDetailsSerializer(productinventorydetails, many=True)

        products = Products.objects.filter(
            productinventorydetails__Inventory__Headquarters__Organizations=organization
        ).distinct()
        products_serializer = ProductSerializer(products, many=True)

        return Response({
            "organization": organization.name,
            "headquarters": headquarters_serializer.data,
            "inventories": inventories_serializer.data,
            "productinventorydetails": productinventorydetails_serializer.data,
            "products": products_serializer.data,
        })

#-------------------------------------------------------------------------