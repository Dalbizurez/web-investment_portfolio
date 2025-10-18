import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import '../styles/form_signup.css';

import Logo from '../assets/FIcon.png';

export default function SignupForm() {
    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log('Email:', email);
        console.log('Username:', username);
        console.log('Password:', password);
    }


    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(password, confirmPassword);
        if (password !== e.target.value) {
            document.getElementById('confirm')?.classList.add('error');
        } else {
            document.getElementById('confirm')?.classList.remove('error');
        }
    }

    return (
        <section className="signup-section">
            <title>Hapi | Sign Up</title>
            <div className="signup-container">
                <img src={Logo} alt="Logo" className="signup-logo" />
                
                <div className="signup-box">
                    <h2>Create your account</h2>
                    <form onSubmit={handleSubmit} className="signup-form">
                        <input placeholder="Email"
                            name='email'
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input placeholder="Username"
                            name='username'
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <input placeholder="Password"
                            name='password'
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <input id="confirm" placeholder="Confirm Password"
                            name='confirmPassword'
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                handleConfirmPasswordChange(e);
                            }}
                            required
                        />
                        
                        <Link to="/invite">
                            <button type="button" className="signup-button">Sign Up</button>
                        </Link>

                        <p>Already have an account? <Link to="/signin">Log in</Link></p>
                    </form>
                </div>
            </div>
        </section>
    )
}