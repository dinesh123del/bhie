"use client"

import { useEffect } from 'react'
import ErrorBoundary from '@/src/components/ErrorBoundary'

export default function Error({
	error,
	reset,
}: {
	error: Error
	reset: () => void
}) {
	useEffect(() => {
		console.error(error)
	}, [error])

	return (
		<ErrorBoundary>
			<div className="min-h-screen bg-[#050505] flex items-center justify-center p-8 relative overflow-hidden">
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/10 blur-[120px] rounded-full" />
				<div className="relative z-10 text-center max-w-md">
					<h1 className="text-4xl font-black text-white mb-4 tracking-tight">Something went wrong!</h1>
					<p className="text-[#C0C0C0] mb-8 leading-relaxed">
						{error.message || "An unexpected error occurred."}
					</p>
					<button
						onClick={() => reset()}
						className="w-full px-8 py-4 bg-white text-black font-bold rounded-2xl text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
					>
						Try again
					</button>
				</div>
			</div>
		</ErrorBoundary>
	)
}
