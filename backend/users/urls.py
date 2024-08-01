from django.urls import path, re_path
from .views import (
    CustomProviderAuthView,
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    CustomTokenVerifyView,
    LogoutView,
    CheckCompleteView,
    UserTypeUpdate,
    CreateOrganization,
    CreatePerson,
    CheckUserType,
    RetrieveImageView,
    UploadImageView,
    CandidateDetailView,
    ApproveCandidate,
    RejectCandidate,
    RetrievePersonView,
    RetrieveUserOrganizations,

    #CRUD
    OrganizationsListCreate, OrganizationsRetrieveUpdateDestroy,
    HeadquartersListCreate, HeadquartersRetrieveUpdateDestroy,
    StatusesListCreate, StatusesRetrieveUpdateDestroy,
    CategoriesListCreate, CategoriesRetrieveUpdateDestroy,
    ProductsListCreate, ProductsRetrieveUpdateDestroy,
    InventoriesListCreate, InventoriesRetrieveUpdateDestroy,
    ProductInventoryDetailsListCreate, ProductInventoryDetailsRetrieveUpdateDestroy,
    DonationsListCreate, DonationsRetrieveUpdateDestroy,
    DonationProductDetailsListCreate, DonationProductDetailsRetrieveUpdateDestroy,

    # Visulizaciones: 
    # OrganizationDetailsView,
    # OrganizationDonationsView,
)

urlpatterns = [
    re_path(
        r'^o/(?P<provider>\S+)/$',
        CustomProviderAuthView.as_view(),
        name='provider-auth'
    ),
    path('user/<int:user_id>/organizations/', RetrieveUserOrganizations.as_view()),
    path('person/<int:user_id>/', RetrievePersonView.as_view()),
    path('candidate/<int:candidate_id>/approve/', ApproveCandidate.as_view()),
    path('candidate/<int:candidate_id>/reject/', RejectCandidate.as_view()),
    path('candidate-details', CandidateDetailView.as_view()),
    path('retrieve-logo', RetrieveImageView.as_view()),
    path('upload-image', UploadImageView.as_view()),
    path('user/<int:user_id>/check-usertype', CheckUserType.as_view()),
    path('user/person', CreatePerson.as_view()),
    path('user/organization', CreateOrganization.as_view()),
    path('user/<int:pk>/complete', UserTypeUpdate.as_view()),
    path('user/<int:user_id>/check-complete', CheckCompleteView.as_view()),
    path('jwt/create/', CustomTokenObtainPairView.as_view()),
    path('jwt/refresh/', CustomTokenRefreshView.as_view()),
    path('jwt/verify/', CustomTokenVerifyView.as_view()),
    path('logout/', LogoutView.as_view()),

    #CRUD:
    path('organizations/', OrganizationsListCreate.as_view()),
    path('organizations/<int:pk>/', OrganizationsRetrieveUpdateDestroy.as_view()),
    path('headquarters/', HeadquartersListCreate.as_view()),
    path('headquarters/<int:pk>/', HeadquartersRetrieveUpdateDestroy.as_view()),
    path('statuses/', StatusesListCreate.as_view()),
    path('statuses/<int:pk>/', StatusesRetrieveUpdateDestroy.as_view()),
    path('categories/', CategoriesListCreate.as_view()),
    path('categories/<int:pk>/', CategoriesRetrieveUpdateDestroy.as_view()),
    path('products/', ProductsListCreate.as_view()),
    path('products/<int:pk>/', ProductsRetrieveUpdateDestroy.as_view()),
    path('inventories/', InventoriesListCreate.as_view()),
    path('inventories/<int:pk>/', InventoriesRetrieveUpdateDestroy.as_view()),
    path('productinventorydetails/', ProductInventoryDetailsListCreate.as_view()),
    path('productinventorydetails/<int:pk>/', ProductInventoryDetailsRetrieveUpdateDestroy.as_view()),
    path('donations/', DonationsListCreate.as_view()),
    path('donations/<int:pk>/', DonationsRetrieveUpdateDestroy.as_view()),
    path('donationproductdetails/', DonationProductDetailsListCreate.as_view()),
    path('donationproductdetails/<int:pk>/', DonationProductDetailsRetrieveUpdateDestroy.as_view()),

    # Visulizaciones URLs
    # path('inventory/<int:pk>/', OrganizationDetailsView.as_view()),
    # path('donation/<int:pk>/', OrganizationDonationsView.as_view()),
]
