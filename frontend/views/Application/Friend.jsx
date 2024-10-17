import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Card, Col, Row, Tab } from "react-bootstrap";
import '@/app/dashboard/profile.css';
// img
import avatar1 from "@/public/assets/images/user/avatar-1.jpg";
import { useRetrieveUserQuery } from '@/redux/features/authApiSlice';

const Friends = ({ userId }) => {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { data: user } = useRetrieveUserQuery();

    useEffect(() => {
        // Función para obtener las organizaciones del usuario
        const fetchOrganizations = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/user/${user.id}/organizations`);
                const data = await response.json();
                if (response.ok) {
                    setOrganizations(data.organizations);
                } else {
                    console.error('Error al obtener las organizaciones:', data.error);
                }
            } catch (error) {
                console.error('Error al obtener las organizaciones:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrganizations();
    }, [userId]);

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <React.Fragment>
            <Tab.Pane eventKey="friendsRequest">
                <Card>
                    <Card.Body>
                        <Row>
                            <h5>Tus Organizaciones</h5>
                            <h1></h1><h1></h1>
                            {
                                organizations.length > 0 ? (
                                    organizations.map((org, index) => (
                                        <Col xl={4} xxl={4} key={index}>
                                            <Card className="border shadow-none">
                                                <Card.Body>
                                                    <div className="text-center">
                                                        <div className="chat-avtar d-sm-inline-flex">
                                                        <Image 
                                                        className="rounded-circle img-thumbnail img-fluid wid-80" 
                                                        src={org.profile_image ? `http://localhost:8000${org.profile_image}` : avatar1} 
                                                        alt={org.name || "Imagen de la organización"} 
                                                        width={100}
                                                        height={100}
                                                        />
                                                        </div>
                                                        <div className="my-3">
                                                            <h5 className="mb-0">{org.name}</h5>
                                                        </div>
                                                    </div>
                                                    <Row className="g-2">
                                                        <Col xs={6}>
                                                            <div className="d-flex justify-content-between ">
                                                                <a
                                                                    className="btn btn-primary buttonorg_perf"
                                                                    href={`dashboard/${org.id}/home`}   
                                                                    size="sm"
                                                                >
                                                                    Entrar
                                                                </a> 
                                                                <a
                                                                    className="btn btn-outline-primary buttonorg_perf"
                                                                    href={`dashboard/${org.id}/organization`}
                                                                    size="sm"
                                                                >
                                                                    Perfil
                                                                </a>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))
                                ) : (
                                    <Col>
                                        <div className="text-center">
                                            <h6>No se encontraron organizaciones para este usuario.</h6>
                                        </div>
                                    </Col>
                                )
                            }
                        </Row>
                    </Card.Body>
                </Card>
            </Tab.Pane>
        </React.Fragment>
    );
}

export default Friends;
