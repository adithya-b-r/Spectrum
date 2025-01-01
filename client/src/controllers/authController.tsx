import axios from 'axios';
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get("http://localhost:3000/users/isauth");

        if (response.status === 200) {
          setIsLoggedIn(true);
          console.log("User is authenticated");
        }
        else {
          setIsLoggedIn(false);
          console.log("User is not authenticated");
        }

      } catch (err) {
        console.log("Error: " + err);
      }
    }

    checkAuthStatus();
  }, []);

  return isLoggedIn;
};
