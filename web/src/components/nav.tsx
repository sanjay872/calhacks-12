import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className="flex justify-between items-center p-4">
            <Link to="/"><img src={'/assets/logo.png'} alt="logo" className="w-10 h-10" /></Link>
        </nav>
    )
}