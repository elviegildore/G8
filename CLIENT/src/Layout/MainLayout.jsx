import {Outlet, useLocation} from 'react-router-dom'
import Header from '../Components/Header.jsx';
import Footer from '../Components/Footer';


const MainLayout = () => {
    const location = useLocation();
  return (
    <div className='text-black'>
        <Header  />

        <Outlet/>
      

        <Footer />





    </div>
  )
}

export default MainLayout