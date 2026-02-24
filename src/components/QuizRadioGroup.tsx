import { motion } from "framer-motion";
import { fadeInUp, tapScale } from "@/lib/animations";

interface QuizRadioGroupProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}

const QuizRadioGroup = ({ options, value, onChange, label }: QuizRadioGroupProps) => (
  <motion.div variants={fadeInUp}>
    <label className="block font-display font-semibold text-lg mb-3">{label}</label>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map((opt) => (
        <motion.button
          key={opt}
          onClick={() => onChange(opt)}
          whileTap={tapScale}
          className={`text-left px-4 py-3 rounded-xl text-sm transition-all ${
            value === opt
              ? "bg-primary/10 border border-primary text-foreground"
              : "bg-card border border-border text-muted-foreground hover:border-muted-foreground/30"
          }`}
        >
          {opt}
        </motion.button>
      ))}
    </div>
  </motion.div>
);

export default QuizRadioGroup;
