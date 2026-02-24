import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import { Hash, Calendar, Crown, Clock } from "lucide-react";

export function AccountSkeleton() {
  return (
    <motion.div
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Navbar rightContent={<Skeleton className="h-8 w-24 rounded-lg" />} />

      <div className="pt-24 pb-16 container mx-auto px-4 max-w-3xl">
        <div className="mb-6">
          <Skeleton className="w-9 h-9 rounded-xl" />
        </div>

        <div className="space-y-2 mb-8">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-40" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Hash, delay: 0 },
            { icon: Calendar, delay: 0.05 },
            { icon: Crown, delay: 0.1 },
          ].map(({ icon: Icon, delay }, i) => (
            <motion.div
              key={i}
              className="p-5 rounded-2xl bg-card border border-border text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay }}
            >
              <div className="flex justify-center mb-2">
                <Icon className="w-5 h-5 text-muted-foreground/50" />
              </div>
              <Skeleton className="h-8 w-12 mx-auto mb-2" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-8">
          <Skeleton className="flex-1 h-12 rounded-xl" />
          <Skeleton className="flex-1 h-12 rounded-xl" />
        </div>

        {/* Pick History */}
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-muted-foreground/50" />
          <Skeleton className="h-5 w-32" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="p-4 rounded-2xl bg-card border border-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="w-4 h-4 rounded shrink-0" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
