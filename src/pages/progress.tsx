import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import ProgressCharts from '@/components/ProgressCharts';

const ProgressPage = () => {
  return (
    <>
      <Helmet>
        <html lang="en" />
        <title>Progress | Running Page</title>
      </Helmet>
      <Layout>
        <div className="w-full">
          <ProgressCharts />
        </div>
      </Layout>
    </>
  );
};

export default ProgressPage;
