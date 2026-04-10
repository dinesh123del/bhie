import { motion } from 'framer-motion'
import LoadingScreen from '@/src/components/LoadingScreen'

export default function Loading() {
         return (
                  <motion.div
                           initial={{ opacity: 1 }}
                           animate={{ opacity: 1 }}
                           className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
                  >
                           <LoadingScreen />
                  </motion.div>
         )
}
