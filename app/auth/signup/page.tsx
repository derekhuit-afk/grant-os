import { Suspense } from 'react'
import SignupForm from './form'

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F2D1F] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C8960C] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}
