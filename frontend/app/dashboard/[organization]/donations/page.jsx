"use client";

import React, { useState, useEffect } from 'react';
import './donation.css';
import Layout from '@/layouts/dashboard/index';
import BreadcrumbItem from '@/common/BreadcrumbItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import {Form, Col, Row } from 'react-bootstrap';

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [organizationId, setOrganizationId] = useState("");

  useEffect(() => {
      const currentUrl = window.location.href;
      const url = new URL(currentUrl);
      const pathSegments = url.pathname.split('/');
      const dashboardIndex = pathSegments.indexOf('dashboard');
      if (dashboardIndex !== -1 && pathSegments.length > dashboardIndex + 1) {
          setOrganizationId(pathSegments[dashboardIndex + 1]);
      }
  }, []);


  useEffect(() => {
    fetchDonations();
  }, [organizationId]);

  const fetchDonations = async () => {
    if (organizationId) {
      try {
        const response = await axios.get(`http://localhost:8000/api/donations/`, {
          params: {
            org_id: organizationId
          }
        });
        setDonations(response.data);
      } catch (error) {
        console.error('Error fetching donations:', error);
      }
    }
  };
  
  const deleteDonation = async (donationId) => {
    try {
        await axios.delete('http://localhost:8000/api/donation/detail/', {
            params: {
                org_id: organizationId,
                donation_id: donationId
            }
        });
        setDonations(donations.filter(item => item.id !== donationId));
        handleDeleteProductModalClose();
    } catch (error) {
        console.error('Error deleting donation:', error);
    }
};

  const handleInventoryModalClose = () => setShowInventoryModal(false);
  const handleInventoryModalShow = () => setShowInventoryModal(true);

  const handleProductModalShow = (product) => {
    setSelectedProduct(product);
    console.log(selectedProduct)
    setShowProductModal(true);
  };

  const handleProductModalClose = () => setShowProductModal(false);

  const handleDeleteProductModalShow = (product) => {
    setSelectedProduct(product);
    setShowDeleteProductModal(true);
  };

  const handleDeleteProductModalClose = () => setShowDeleteProductModal(false);

  const handleAddDonation = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
  
    const donationData = {
      description: formData.get('description'),
      date: formData.get('expDate'),
      type: formData.get('Category'),
      quantity: formData.get('quantity')
    };
  
    try {
      await axios.post(`http://localhost:8000/api/donations/`, donationData, {
        params: {
          org_id: organizationId,
        },
      });
      fetchDonations(); 
      handleInventoryModalClose();
    } catch (error) {
      console.error('Error adding donation:', error);
    }
  };
  
  return (
    <div className="card">
      <h2>Donations</h2>
      {donations.length === 0 ? (
        <>
          <br />
          <p>No record found.</p>
          <button className="add-button" onClick={handleInventoryModalShow}>
            <FontAwesomeIcon icon={faPlus} className='hover-button' />
          </button>
        </>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th className='text-center'>Description</th>
                <th className='text-center'>Units</th>
                <th className='text-center'>Date</th>
                <th className='text-center'>Category</th>
                <th className='text-center'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {donations.map(item => (
                <tr key={item.id}>
                  <td className='text-center p-donation'><b>{item.description}</b></td>
                  <td className="text-center p-donation">
                    {item.type === "Money" ? `$ ${item.quantity}` : item.quantity}
                  </td>
                  <td className='text-center p-donation'><b>{item.date}</b></td>
                  <td
                    className="text-center p-donation"
                    style={{
                      color:
                        item.type === "Food"
                          ? "#795548"
                          : item.type === "Tools"
                          ? "#2196F3"
                          : item.type === "Drinks"
                          ? "#FF9800"
                          : item.type === "Money"
                          ? "#2BC155"
                          : item.type === "Other"
                          ? "#9E9E9E"
                          : item.type === "Medications"
                          ? "#FF3E3E"
                          : item.type === "Clothes"
                          ? "#9C27B0"
                          : "inherit", // Color por defecto si no coincide ningún caso
                    }}
                  >
                    {item.type}
                  </td>
                  <td className='text-center'>
                    <button className="icon-button" onClick={() => handleProductModalShow(item)}>
                      <FontAwesomeIcon icon={faEye} className='hover-button' />
                    </button>
                    <button className="icon-button" onClick={() => handleDeleteProductModalShow(item.id)}>
                      <FontAwesomeIcon icon={faTrash} className='hover-button-trash' />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="add-button" onClick={handleInventoryModalShow}>
            <FontAwesomeIcon icon={faPlus} className='hover-button' />
          </button>
        </>
      )}

      {/* Add Inventory Modal */}
      <Modal show={showInventoryModal} onHide={handleInventoryModalClose} backdropClassName="modal-backdrop" centered size='xl'>
        <Modal.Header closeButton>
          <Modal.Title>Add Donation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className='container'>
              <div className='row'>
                <div className="mb-3 col-md-4">
                  <label htmlFor="productName" className="form-label">Name</label>
                  <input type="text" className="form-control" id="description" name="description" placeholder='Add Name' required />
                </div>
                <div className="mb-3 col-md-3">
                <label htmlFor="productType" className="form-label">Type</label>
                  <Form.Control as="select" className="form-select" id="Category" name="Category">
                                    <option>Clothes</option>
                                    <option>Food</option>
                                    <option>Drinks</option>
                                    <option>Medications</option>
                                    <option>Tools</option>
                                    <option>Other</option>
                                    <option>Money</option>
                  </Form.Control>
                </div>
                <div className="mb-3 col-md-2">
                  <label htmlFor="quantity" className="form-label">Quantity / Amount</label>
                  <input type="number" className="form-control" id="quantity" name="quantity" placeholder='1' required />
                </div>
                <div className="mb-3 col-md-3">
                  <label htmlFor="expDate" className="form-label">Date</label>
                  <input type="date" className="form-control" id="expDate" name="expDate" />
                </div>
              </div>
              <div className='d-flex justify-content-center'>
                <Button variant="primary" type="submit" className='col-md-3 mt-40'>
                  Add Donation
                </Button>
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Product Details Modal */}
      <Modal show={showProductModal} onHide={handleProductModalClose} backdropClassName="modal-backdrop" centered size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Donation Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {selectedProduct && (
          <div>
            <p><strong>Description:</strong> {selectedProduct.description}</p>
            <p><strong>Date:</strong> {selectedProduct.date}</p>
            <p><strong>Quantity:</strong> {selectedProduct.quantity}</p>
            <p><strong>Type:</strong> {selectedProduct.type}</p>
          </div>
        )}
      </Modal.Body>
      </Modal>

      {/* Delete Product Modal */}
      <Modal show={showDeleteProductModal} onHide={handleDeleteProductModalClose} backdropClassName="modal-backdrop" centered size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Delete Donation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete the donation?</p>
          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={handleDeleteProductModalClose} className="me-2">
              Cancel
            </Button>
            <Button variant="danger" onClick={() => deleteDonation(selectedProduct)}>
              Delete
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

const BuySell = () => {
  const [buysell, setBuysell] = useState([]);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [organizationId, setOrganizationId] = useState("");

  useEffect(() => {
      const currentUrl = window.location.href;
      const url = new URL(currentUrl);
      const pathSegments = url.pathname.split('/');
      const dashboardIndex = pathSegments.indexOf('dashboard');
      if (dashboardIndex !== -1 && pathSegments.length > dashboardIndex + 1) {
          setOrganizationId(pathSegments[dashboardIndex + 1]);
      }
  }, []);


  useEffect(() => {
    fetchBuySell();
  }, [organizationId]);

  const fetchBuySell = async () => {
    if (organizationId) {
      try {
        const response = await axios.get(`http://localhost:8000/api/organization/${organizationId}/operation`, {
        });
        setBuysell(response.data);
      } catch (error) {
        console.error('Error fetching donations:', error);
      }
    }
  };

  const deleteBuySell = async (buySellId) => {
    try {
      await axios.delete(`/api/buysell/${buySellId}`); // URL del endpoint para eliminar compra/venta
      setBuysell(buysell.filter(item => item.id !== buySellId));
      handleDeleteProductModalClose();
    } catch (error) {
      console.error('Error deleting buy/sell:', error);
    }
  };

  const handleInventoryModalClose = () => setShowInventoryModal(false);
  const handleInventoryModalShow = () => setShowInventoryModal(true);

  const handleProductModalShow = (product) => {
    setSelectedProduct(product);
    console.log(product)
    setShowProductModal(true);
  };

  const handleProductModalClose = () => setShowProductModal(false);

  const handleDeleteProductModalShow = (product) => {
    setSelectedProduct(product);
    setShowDeleteProductModal(true);
  };

  const handleDeleteProductModalClose = () => setShowDeleteProductModal(false);

  return (
    <div className="card">
      <h2>Buy/Sell</h2>
      {buysell.length === 0 ? (
        <>
          <br />
          <p>No record found.</p>
          <button className="add-button" onClick={handleInventoryModalShow}>
            <FontAwesomeIcon icon={faPlus} className='hover-button' />
          </button>
        </>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th className='text-center'>Name</th>
                <th className='text-center'>Units</th>
                <th className='text-center'>Amount</th>
                <th className='text-center'>Date</th>
                <th className='text-center'>Operation</th>
                <th className='text-center'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {buysell.map(item => (
                <tr key={item.id}>
                  <td className='text-center p-donation'><b>{item.description}</b></td>
                  <td className='text-center p-donation'>{item.quantity}</td>
                  <td className='text-center p-donation'>$ {item.amount}</td>
                  <td className='text-center p-donation'><b>{item.date}</b></td>
                  <td className={`text-center p-donation ${item.type === 'Purchase' ? 'text-green' : 'text-red'}`}>
                    {item.type === 'Purchase' ? (
                      <>
                        <i className="fa fa-arrow-up text-green"></i> {item.type}
                      </>
                    ) : (
                      <>
                        <i className="fa fa-arrow-down text-red"></i> {item.type}
                      </>
                    )}
                  </td>
                  <td className='text-center'>
                    <button className="icon-button" onClick={() => handleProductModalShow(item)}>
                      <FontAwesomeIcon icon={faEye} className='hover-button' />
                    </button>
                    <button className="icon-button" onClick={() => handleDeleteProductModalShow(item)}>
                      <FontAwesomeIcon icon={faTrash} className='hover-button-trash' />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="add-button" onClick={handleInventoryModalShow}>
            <FontAwesomeIcon icon={faPlus} className='hover-button' />
          </button>
        </>
      )}

      {/* Add Inventory Modal */}
      <Modal show={showInventoryModal} onHide={handleInventoryModalClose} backdropClassName="modal-backdrop" centered size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Add Operation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className='container'>
              <div className='row'>
                <div className="mb-3 col-md-4">
                  <label htmlFor="productName" className="form-label">Name</label>
                  <input type="text" className="form-control" id="productName" name="name" placeholder='Product Name' required />
                </div>
                <div className="mb-3 col-md-2">
                  <label htmlFor="quantity" className="form-label">Quantity</label>
                  <input type="number" className="form-control" id="quantity" name="quantity" placeholder='1' required />
                </div>
                <div className="mb-3 col-md-2">
                  <label htmlFor="quantity" className="form-label">Amount</label>
                  <input type="number" className="form-control" id="amount" name="amount" placeholder='$ 1' required />
                </div>
                <div className="mb-3 col-md-4">
                  <label htmlFor="productType" className="form-label">Operation Type</label>
                  <Form.Control as="select" className="form-select" name="category">
                                    <option>Purchase</option>
                                    <option>Sale</option>
                  </Form.Control>
                </div>
              </div>
              <div className='d-flex justify-content-center'>
                <Button variant="primary" type="submit" className='mt-10'>
                  Add Operation
                </Button>
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Product Details Modal */}
      <Modal show={showProductModal} onHide={handleProductModalClose} backdropClassName="modal-backdrop" centered size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Operation Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <div>
              <p><strong>Description:</strong> {selectedProduct.description}</p>
              <p><strong>Quantity:</strong> {selectedProduct.quantity}</p>
              <p><strong>Amount:</strong> {selectedProduct.amount}</p>
              <p><strong>Date:</strong> {selectedProduct.date}</p>
              <p><strong>Type:</strong> {selectedProduct.type}</p>
              <p><strong>Products:</strong></p>
                <ul>
                  {selectedProduct.operation_products && selectedProduct.operation_products.length > 0 ? (
                    selectedProduct.operation_products.map((product, index) => (
                      <li key={index}>
                        <strong>Name:</strong> {product.product_name}
                      </li>
                    ))
                  ) : (
                    <li>No products found</li>
                  )}
                </ul>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Delete Product Modal */}
      <Modal show={showDeleteProductModal} onHide={handleDeleteProductModalClose} backdropClassName="modal-backdrop" centered size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Delete Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete the product <strong>{selectedProduct?.name}</strong>?</p>
          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={handleDeleteProductModalClose} className="me-2">
              Cancel
            </Button>
            <Button variant="danger" onClick={() => deleteBuySell(selectedProduct.id)}>
              Delete
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

const Page = () => {
  return (
    <Layout>
      <BreadcrumbItem mainTitle="Resource Management" subTitle="Operations" />
      <div className="container both-cont">
        <div className='row'>
          <div className="col-md-6">
            <Donations />
          </div>
          <div className="col-md-6">
            <BuySell />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Page;
