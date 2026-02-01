import ActivityList from '@/components/ActivityList';
import { Helmet } from 'react-helmet-async';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <html lang="en" />
      </Helmet>
      <ActivityList />
    </>
  );
};

export default HomePage;
