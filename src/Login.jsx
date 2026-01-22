import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
// Import the real login function
import { loginUser } from "./lib/supabaseClient"; 
import Logo from "./assets/logo-valley.png";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  
  // Determine if this is patient or staff login based on URL
  const urlParams = new URLSearchParams(window.location.search);
  const isPatientLogin = urlParams.get('type') === 'patient';
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const showMessage = (title, message, isSuccess = true) => {
    const msgBox = document.getElementById("message-box");
    if (msgBox) {
      msgBox.innerHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded-lg shadow-2xl max-w-sm text-center">
            <h3 class="text-xl font-bold ${isSuccess ? 'text-green-600' : 'text-red-600'} mb-4">${title}</h3>
            <p class="text-gray-700 mb-4">${message}</p>
            <button id="close-modal" class="bg-${isSuccess ? 'green' : 'red'}-600 text-white px-4 py-2 rounded-md hover:opacity-90">Close</button>
          </div>
        </div>
      `;
      document.getElementById("close-modal").onclick = () => {
        msgBox.innerHTML = "";
      };
    }
  };

  const resetForm = () => {
    setFormData({ email: "", password: "" });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.email || !formData.password) {
        showMessage("Validation Error", "Please fill in all required fields.", false);
        setIsSubmitting(false);
        return;
      }

      // 1. Call actual Supabase Auth
      const result = await loginUser(formData.email, formData.password);

      if (result.success) {
        // 2. Role Verification 
        // Checks the metadata role we set during Signup
        const intendedRole = isPatientLogin ? 'patient' : 'staff';
        
        if (result.role !== intendedRole) {
          showMessage(
            "Access Denied", 
            `This account is registered as a ${result.role}. Please use the correct login portal.`, 
            false
          );
          setIsSubmitting(false);
          return;
        }

        // 3. Store in localStorage for your existing filtering logic
        if (isPatientLogin) {
          localStorage.setItem('currentPatientEmail', formData.email.toLowerCase().trim());
          localStorage.setItem('isPatientLoggedIn', 'true');
        } else {
          localStorage.removeItem('currentPatientEmail');
          localStorage.removeItem('isPatientLoggedIn');
        }

        showMessage(
          "Login Successful!",
          `Redirecting to your dashboard...`,
          true
        );
        resetForm();

        // 4. Redirect
        setTimeout(() => {
          if (isPatientLogin) {
            navigate("/homepage"); 
          } else {
            navigate("/dashboard");
          }
        }, 1500);
      } else {
        // This catches "Invalid login credentials" or "Email not confirmed"
        showMessage("Login Failed", result.error, false);
      }
    } catch (error) {
      console.error("Login Error:", error);
      showMessage("Login Failed", "An unexpected error occurred. Please try again.", false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Re-using your existing UI structure
  const loginTitle = isPatientLogin ? "Patient Login" : "Clinic Staff Login";
  const loginDesc = isPatientLogin ? "Sign in to access your patient dashboard." : "Sign in to access the clinic dashboard.";
  const emailPlaceholder = isPatientLogin ? "patient@example.com" : "staff@example.com";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-sm shadow-xl border-t-4 border-green-600">
        <div className="p-4 border-b border-gray-200">
          <Button onClick={() => navigate("/")} variant="outline" size="sm" className="text-green-600 border-green-600">
            ← Back
          </Button>
        </div>
        <div className="flex justify-center items-center mt-4">
          <img src={Logo} alt="Logo" className="w-[190px] h-20 object-contain" />
        </div>

        <CardHeader>
          <CardTitle className="text-center text-green-700">{loginTitle}</CardTitle>
          <p className="text-center text-sm text-gray-500">{loginDesc}</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder={emailPlaceholder} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input id="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Enter your password" required />
            </div>

            <Button type="submit" className="w-full bg-[#047a52] hover:bg-[#03503a] text-white" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>

            {isPatientLogin && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                  <div className="relative flex justify-center text-sm"><span className="px-2 bg-gray-50 text-gray-500">OR</span></div>
                </div>

                <div className="space-y-3">
                  <Button type="button" onClick={() => navigate("/signup")} variant="outline" className="w-full border-green-600 text-green-600">
                    Don't have an account? Sign Up
                  </Button>
                  <Button type="button" onClick={() => navigate("/checkin?view=patient")} variant="outline" className="w-full border-blue-600 text-blue-600">
                    Join as Guest (View Slots)
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
      <div id="message-box"></div>
    </div>
  );
}

export default Login;