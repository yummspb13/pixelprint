'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calculator, Upload, ArrowRight, CheckCircle2, Clock, Award } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-px-bg via-px-bg to-px-cyan/5 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="space-y-4">
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-px-fg leading-tight">
                London's Premier{' '}
                <span className="bg-gradient-to-r from-px-cyan to-px-magenta bg-clip-text text-transparent">
                  Typography
                </span>
              </h1>
              <p className="text-lg text-px-muted max-w-lg">
                Professional printing services for businesses across London. 
                Business stationery, large format, digital printing, and expert finishing.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-px-cyan hover:bg-px-cyan/90 text-white text-lg px-8 py-6">
                <Link href="/calculate">
                  <Calculator className="mr-2 h-5 w-5" />
                  Calculate Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-px-magenta text-px-magenta hover:bg-px-magenta hover:text-white text-lg px-8 py-6">
                <Link href="/upload">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Artwork
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-px-cyan" />
                <span className="text-sm font-medium text-px-fg">Preflight Check</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-px-magenta" />
                <span className="text-sm font-medium text-px-fg">Same-Day Options</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-px-yellow" />
                <span className="text-sm font-medium text-px-fg">Award Winning</span>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Print Samples */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {/* Sample 1 - Business Card */}
              <motion.div
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-px-cyan to-px-magenta rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white rounded-2xl p-4 shadow-2xl transform rotate-3 group-hover:rotate-0 transition-transform duration-300">
                  <div className="w-full h-48 bg-gradient-to-br from-px-cyan/10 to-px-magenta/10 rounded-lg flex items-center justify-center">
                    <span className="text-px-fg font-heading font-bold text-sm">Business Card</span>
                  </div>
                </div>
              </motion.div>

              {/* Sample 2 - Flyer */}
              <motion.div
                className="relative group mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-px-magenta to-px-yellow rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white rounded-2xl p-4 shadow-2xl transform -rotate-2 group-hover:rotate-0 transition-transform duration-300">
                  <div className="w-full h-48 bg-gradient-to-br from-px-magenta/10 to-px-yellow/10 rounded-lg flex items-center justify-center">
                    <span className="text-px-fg font-heading font-bold text-sm">Flyer</span>
                  </div>
                </div>
              </motion.div>

              {/* Sample 3 - Poster */}
              <motion.div
                className="relative group col-span-2 justify-self-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-px-yellow to-px-cyan rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white rounded-2xl p-4 shadow-2xl transform rotate-1 group-hover:rotate-0 transition-transform duration-300">
                  <div className="w-full h-32 bg-gradient-to-br from-px-yellow/10 to-px-cyan/10 rounded-lg flex items-center justify-center">
                    <span className="text-px-fg font-heading font-bold text-sm">Large Format Poster</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Floating Elements */}
            <motion.div
              className="absolute -top-4 -right-4 w-20 h-20 bg-px-cyan/20 rounded-full blur-xl"
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute -bottom-4 -left-4 w-32 h-32 bg-px-magenta/20 rounded-full blur-xl"
              animate={{
                y: [0, 10, 0],
                scale: [1, 0.9, 1]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}