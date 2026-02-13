import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doctors } from "./doctorData";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, ChevronRight } from "lucide-react";
import Logo from "./assets/logo-valley.png";

const DoctorSelection = () => {
    const navigate = useNavigate();
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);

    const handleDoctorClick = (doctor) => {
        setSelectedDoctor(doctor);
        setShowModal(true);
        setPassword("");
        setError("");
    };

    const handleVerify = (e) => {
        e.preventDefault();
        // Verification logic
        if (password === "doctor123") {
            // Store doctor ID in localStorage
            localStorage.setItem('selectedDoctorId', selectedDoctor.id);
            // Redirect to dashboard with specific doctor state
            navigate("/dashboard", { state: { defaultDoctorId: selectedDoctor.id } });
        } else {
            setError("Incorrect password. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-8">
            <div className="max-w-6xl mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col items-center mb-10">
                    <img src={Logo} alt="Logo" className="w-[220px] mb-6" />
                    <h1 className="text-3xl font-bold text-green-800">Doctor Profile Selection</h1>
                    <p className="text-gray-600 mt-2">Please select your profile to continue to your dashboard</p>
                </div>

                {/* Doctor Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {doctors.map((doctor) => (
                        <Card
                            key={doctor.id}
                            className="hover:shadow-2xl transition-all duration-300 border-t-4 border-green-600 cursor-pointer group"
                            onClick={() => handleDoctorClick(doctor)}
                        >
                            <CardContent className="p-6 flex flex-col items-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
                                    <User className="w-10 h-10 text-green-700 group-hover:text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-center text-gray-800 mb-1">{doctor.name}</h3>
                                <p className="text-sm text-green-600 font-medium mb-4">{doctor.specialization}</p>
                                <Button className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2">
                                    Access Dashboard <ChevronRight className="w-4 h-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Verification Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
                        <CardHeader className="border-b">
                            <CardTitle className="text-xl font-bold text-gray-800">Profile Verification</CardTitle>
                            <p className="text-sm text-gray-500">Accessing Dashboard for <span className="text-green-700 font-bold">{selectedDoctor?.name}</span></p>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleVerify} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Verify your access password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Enter verification password"
                                            className="pl-10"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        Confirm Access
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default DoctorSelection;
