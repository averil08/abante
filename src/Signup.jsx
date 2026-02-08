import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { registerUser } from "./lib/supabaseClient";
import Logo from "./assets/logo-valley.png";
import { useNavigate } from "react-router-dom";

// THIS IS ONLY FOR PATIENTS
function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const showMessage = (title, message, isSuccess = true) => {
    const messageBox = document.getElementById("message-box");
    if (messageBox) {
      messageBox.innerHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded-lg shadow-2xl max-w-md text-center">
            <h3 class="text-xl font-bold ${isSuccess ? 'text-green-600' : 'text-red-600'} mb-4">${title}</h3>
            <p class="text-gray-700 mb-4 whitespace-pre-line">${message}</p>
            ${isSuccess ? '<p class="text-sm text-gray-500 mb-4">📧 Check your inbox and click the verification link.</p>' : ''}
            <button id="close-btn" class="bg-${isSuccess ? 'green' : 'red'}-600 text-white px-4 py-2 rounded-md hover:opacity-90">Close</button>
          </div>
        </div>
      `;
      document.getElementById("close-btn").onclick = () => {
        messageBox.innerHTML = "";
      };
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Basic Validation
      if (!formData.fullName || !formData.phoneNumber || !formData.email || !formData.password || !formData.confirmPassword) {
        showMessage("Validation Error", "Please fill in all required fields.", false);
        setIsSubmitting(false);
        return;
      }

      // 2. Phone number validation (Strictly 11 digits)
      const phoneRegex = /^\d{11}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        showMessage("Validation Error", "Phone number must be exactly 11 digits and contain only numbers.", false);
        setIsSubmitting(false);
        return;
      }

      // 3. Password length check
      if (formData.password.length < 6) {
        showMessage("Validation Error", "Password must be at least 6 characters long.", false);
        setIsSubmitting(false);
        return;
      }

      // 4. Password match validation
      if (formData.password !== formData.confirmPassword) {
        showMessage("Validation Error", "Passwords do not match. Please try again.", false);
        setIsSubmitting(false);
        return;
      }

      // 5. Call registerUser with correct arguments (Matches your supabaseClient.js)
      // registerUser(email, password, fullName, phoneNumber, role)
      const result = await registerUser(
        formData.email,
        formData.password,
        formData.fullName,
        formData.phoneNumber,
        "patient"
      );

      if (result.success) {
        showMessage(
          "Registration Successful!",
          "Your account has been created. Please check your email to verify your account before logging in.",
          true
        );
        resetForm();
        setTimeout(() => {
          navigate("/");
        }, 4000);
      } else {
        showMessage("Registration Failed", `Error: ${result.error}`, false);
      }
    } catch (error) {
      console.error("Signup error:", error);
      showMessage("Registration Failed", "An unexpected error occurred. Please check your internet and try again.", false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-green-600">
        <div className="p-4 border-b border-gray-200">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="sm"
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            ← Back
          </Button>
        </div>
        <div className="flex justify-center items-center mt-4">
          <img src={Logo} alt="Logo" className="w-[190px] h-20 object-contain" />
        </div>

        <CardHeader>
          <CardTitle className="text-center text-green-700">
            Patient Sign Up
          </CardTitle>
          <p className="text-center text-sm text-gray-500">
            Create an account to manage your medical records.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handlePatientSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-red-600">Full Name *</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Juan Dela Cruz"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-red-600">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="09123456789 (11 digits)"
                required
                maxLength={11}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-red-600">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="patient@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-red-600">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Min. 6 characters"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-red-600">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Re-enter your password"
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#047a52] hover:bg-[#03503a] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Sign Up"}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">OR</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                onClick={() => navigate("/login?type=patient")}
                variant="outline"
                className="w-full border-green-600 text-green-600"
              >
                Already have an account? Log In
              </Button>

              <Button
                type="button"
                onClick={() => navigate("/checkin?view=patient")}
                variant="outline"
                className="w-full border-blue-600 text-blue-600"
              >
                Join as Guest (View Slots)
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div id="message-box"></div>
    </div>
  );
}

export default Signup;