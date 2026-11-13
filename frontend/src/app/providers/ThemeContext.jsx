import React, {createContext,useContext,useEffect} from 'react';
const ThemeContext=createContext();
export function ThemeProvider({children}) {
 useEffect(()=>{document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='light';localStorage.removeItem('theme');},[]);
 return <ThemeContext.Provider value={{theme:'light',isDark:false,isLight:true,toggleTheme:()=>{},setTheme:()=>{}}}>{children}</ThemeContext.Provider>;
}
export function useTheme(){return useContext(ThemeContext);}
