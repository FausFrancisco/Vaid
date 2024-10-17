
// page.jsx
'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/layouts/dashboard/index2';
import { useRetrieveUserQuery } from '@/redux/features/authApiSlice';
import './profile.css';
import Friends from '@/views/Application/Friend';
import FriendsRequest from '@/views/ApplicationExtUser/friendRequest3';
import SocialTab from '@/views/ApplicationExtUser/social-tab3';
import SocialProfile from '@/views/ApplicationExtUser/social-media3';
import Suggestions from '@/views/Application/suggests';
import { Col, Row, Tab } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

const Page = () => {
  const { data: user, isError, isLoading } = useRetrieveUserQuery();
  const [userType, setUserType] = useState(null);
  const { push } = useRouter();

    const [organizationId, setOrganizationId] = useState("");

  return (
    <Layout>
      <Row>
        <Col sm={2}></Col>
        <Col sm={8}>
          <SocialProfile />
            <Tab.Container defaultActiveKey="friendsRequest">
              <SocialTab />
              <Row>
                <Tab.Content>
                  <FriendsRequest />
                </Tab.Content>
              </Row>
            </Tab.Container>
        </Col>
        <Col sm={2}></Col>
      </Row>
    </Layout>
  );
};

export default Page;
