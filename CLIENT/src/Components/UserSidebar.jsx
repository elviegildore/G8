import {useState, useEffect} from 'react';
import {Link} from "react-router-dom";
import {Home, Menu, X, FilePen, FileChartLine} from "lucide-react"

const UserSidebar = () =>  {
  const [isMobile,  setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // This section of code to detect it is on small or mobile screen

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize",
    handleResize);
   }, []);

  const menuItems = [
    {label: "Home", link: "/Userdashboard", icon: <Home size={26}/>},
    {label: "Survey", link: "/Userdashboard/UserSurvey", icon: < FilePen size={26}/>},
    {label: "Profile", link: "/Userdashboard/Profile", icon: < FileChartLine size={26}/>},
    

  
  ];

  return (
    <div className="flex">

        {/* SIDE BAR SECTION*/}

        <aside className={`h-screen bg-white flex flex-col shadow-lg transition-all duration-300 ease-in-out ${isMobile ? "w-16" : "w-64"} flex-shrink-0 pt-16`} >

          {/** TOP PART OF THE SIDEBAR */}

            <div className="flex items-center justify-center p-4 border-b relative">

              {/** LOGO AND TITLE ONLY ON DESKTOP */}
                  {!isMobile && (
                    <div className="flex flex-col items-center justify-center gap-2 w-full">
                      <img src="/g8LOGO.png" alt="Logo" className='w-[50px] h-auto object-contain' />

                      <span className='text-sm font-semibold tracking-widest text-black font-[Montserrat] text-center'>
                        53EBG8
                      </span>
                    </div>
                  )}

              {/** HAMBURGER ONLY ON MOBILE MENU */}
                  {isMobile && (
                    <button onClick={() => setIsOpen(true)} className='text-black'>

                      <Menu size={28}/>
                      
                    </button>
                  )}
            </div>


          {/** FOR DESKTOP NAVIGATION */}
          {!isMobile && (
            <nav className="flex-1 p-2 space-y-2 overflow-y-auto text-black">
              {menuItems.map((items, idx) => (
                <Link key={idx} to={items.link} className='flex items-center gap-3 p-3 rounded hover:bg-stone-300'> 

                {items.icon}
                <span>{items.label}</span>
                </Link>
              ))}
            </nav>
          )}       
        </aside>

        {/** SLIDING NAVIGATION PANEL (MOBILE ONLY) */}
          {isMobile && (
          <div className={`fixed top-0 left-0 h-screen w-56 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            {/** PANEL HEADER WITH LOGO AND TITLE */}
            <div className="flex items-center justify-between p-4 border-b">
              <img src="/g8LOGO.png" alt="Logo" className='w-[35px] h-auto object-contain' />
            

          <span className='text-sm font-semibold tracking-widest text-black font-[Montserrat]'>
            53EBG8
          </span>

          <button onClick={() => setIsOpen(false)} className='text-black'>
              <X size={28} />
           </button>
          </div>
        
        
            
            
          
            
         
        
          {/** PANEL NAVIGATION */}
          
          <nav className="flex-1 p-2 space-y-2 overflow-y-auto text-black">
            {menuItems.map((items, idx) => (
              <Link key={idx} to={items.link} className='flex items-center gap-3 p-3 rounded hover:bg-green-500' onClick={() => setIsOpen(false)}>
              
              {items.icon}
              {items.label}
              </Link>

            ))}

          </nav>
          </div>)}
        
            
            {/** OVERLAY WHEN PANEL IS OPEN */}
            {isMobile && isOpen && (
              <div className='fixed inset-0 bg-white not-visited:bg-opacity-30 z-40' onClick={() => setIsOpen(false)}>
            </div>        

              
                
           
            )}

         </div>
           )};       
  
         
export default UserSidebar;