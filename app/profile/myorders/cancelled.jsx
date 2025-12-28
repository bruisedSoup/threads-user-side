import React from 'react';
import OrderStatusScreen from './OrderStatusScreen';

const CancelledScreen = () => {
  return <OrderStatusScreen status="Cancelled" title="Cancelled Orders" />;
};

export default CancelledScreen;