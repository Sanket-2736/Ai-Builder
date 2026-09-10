import React, { useState } from 'react'
import { LoginLeft } from '../components/LoginLeft'
import { EyeIcon, EyeOffIcon, Link, Loader2Icon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const AuthPage = ({mode}) => {

    const isLogin = mode === 'register';
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [passowrd, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const {login, register} = useAppContext();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if(mode === 'login'){
                await login(email, passowrd);
            } else {
                await register(name, email, passowrd);
            }
            navigate('/');
        } catch (error) {
            setError(error.message || (mode === 'login' ? 'Invalid credentials' : 'Registration failed. Try again later..'));
        } finally {
            setLoading(false);
        }
    }
  return (
    <div>
        {/* left panel - Branding */}
        <LoginLeft/>

        {/* Right Panel - Form */}
        <div className="flex flex-1 items-center justify-center p-8">
            <div className="w-full max-w-sm">
                <div className="mb-10">
                    <h1 className='text-3xl font-medium tracking-tight text-zinc-900 mb-1.5 font-sans'>
                        {isLogin ? "Sign In" : "Create an Account"}
                    </h1>

                    <p className="text-sm text-zinc-400">
                        {isLogin ? "Enter credentials to access your website builder." : "Get started by entering your registration details."}
                    </p>
                </div>

                {
                    error && <div className='mb-6 p-3 border border-red-200 bg-red-50 text-red-700 text-xs rounded'>
                        {error}
                    </div>
                }

                <form className='space-y-6' onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <div>
                                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Full Name</label>
                                <input placeholder='John Doe' type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} id="" className="w-full pl-2 py-2 border-b border-zinc-200 focus:outline-none focus:border-zinc-950 text-sm text-sinc-900 bg-transparent placeholder-zinc-300 transition-colors" />                            
                            </div>
                        </>
                    )}
                    <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Email Address</label>
                        <input placeholder='johndoe@example.com' type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} id="" className="w-full pl-2 py-2 border-b border-zinc-200 focus:outline-none focus:border-zinc-950 text-sm text-sinc-900 bg-transparent placeholder-zinc-300 transition-colors" />                            
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Password</label>
                        <div className="relative">
                            <input placeholder='********' type={showPassword ? "text" : "password"} name="password" value={passowrd} onChange={(e) => setPassword(e.target.value)} id="" className="w-full pl-2 py-2 border-b border-zinc-200 focusoutline-none focusborder-zinc-950 text-sm text-sinc-900 bg-transparent placeholder-zinc-300 transition-colors" />                            
                            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-600 flex items-center justify-center cursor-pointer transition-colors">
                                {showPassword ? <EyeOffIcon size={14}/> : <EyeIcon size={14}/>}
                            </button>
                        </div>
                    </div>

                    <button type='submit' disabled={loading} className="w-full py-2.5 bg-linear-to-br from-red-600 to-amber-600 text-white font-semibold hover:scale-102 disabled:opacity-40 flex items-center justify-center cursor-pointer mt-2 rounded-lg transition-all">
                        {
                            loading && <Loader2Icon className='animate-spin h-3.5 w-3.5 mr-2'/>
                        }
                        {
                            isLogin ? "Signin" : "Register"
                        }
                    </button>
                </form>

                <p className='text-sm text-zinc-400 mt-8 pt-6 border-t border-zinc-100 font-sans'>
                    {isLogin ? (
                        <>
                            New to Builder AI? {" "}
                            <Link to='/register' className='text-zinc-900 font-medium hover:underline'>Create an Account</Link>
                        </>
                    ) : (
                        <>
                            Already have an account? {" "}
                            <Link to='/login' className='text-zinc-900 font-medium hover:underline'>Signin here </Link>
                        </>
                    )}
                </p>
            </div>
        </div>
    </div>
  )
}
