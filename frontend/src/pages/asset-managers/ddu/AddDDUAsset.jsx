import React from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import AssetRegistrationForm from '../../../components/AssetRegistrationForm';

const AddDDUAsset = () => {
  return (
    <DashboardLayout>
      <AssetRegistrationForm assetManagerType="ddu_asset_manager" />
    </DashboardLayout>
  );
};

export default AddDDUAsset;
