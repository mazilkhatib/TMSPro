"use client";

import React, { useEffect } from "react";
import { ChevronRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface Step {
    id: string;
    title: string;
    description?: string;
    icon?: React.ReactNode;
}

interface MultiStepFormProps {
    steps: Step[];
    currentStep: number;
    onStepClick?: (stepIndex: number) => void;
    children: React.ReactNode;
    className?: string;
}

export function MultiStepForm({
    steps,
    currentStep,
    onStepClick,
    children,
    className
}: MultiStepFormProps) {
    return (
        <div className={cn("w-full", className)}>
            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between relative">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStep;
                        const isCurrent = index === currentStep;
                        const isClickable = onStepClick && (isCompleted || index === currentStep);

                        return (
                            <React.Fragment key={step.id}>
                                <motion.div
                                    className="flex flex-col items-center flex-1 relative z-10"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => isClickable && onStepClick(index)}
                                        className={cn(
                                            "relative flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-300 group",
                                            isCompleted && "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30",
                                            isCurrent && "border-primary bg-primary/10 text-primary ring-4 ring-primary/20",
                                            !isCompleted && !isCurrent && "border-muted-foreground/30 bg-muted text-muted-foreground",
                                            isClickable && "hover:border-primary hover:scale-110 cursor-pointer",
                                            !isClickable && "cursor-default"
                                        )}
                                    >
                                        <AnimatePresence mode="wait">
                                            {isCompleted ? (
                                                <motion.div
                                                    key="check"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    exit={{ scale: 0 }}
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                >
                                                    <Check className="w-6 h-6" />
                                                </motion.div>
                                            ) : (
                                                <motion.span
                                                    key="number"
                                                    className="text-lg font-semibold"
                                                    initial={{ scale: 0.8 }}
                                                    animate={{ scale: 1 }}
                                                >
                                                    {index + 1}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </button>

                                    <div className="mt-3 text-center">
                                        <motion.p
                                            className={cn(
                                                "text-sm font-semibold transition-colors",
                                                (isCurrent || isCompleted) ? "text-foreground" : "text-muted-foreground"
                                            )}
                                            animate={{ scale: isCurrent ? 1.05 : 1 }}
                                        >
                                            {step.title}
                                        </motion.p>
                                        {step.description && (
                                            <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                                                {step.description}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>

                                {index < steps.length - 1 && (
                                    <div className="flex-1 h-1 mx-2 sm:mx-4 relative overflow-hidden rounded-full">
                                        <div className="absolute top-0 left-0 w-full h-full bg-muted-foreground/20" />
                                        <motion.div
                                            className={cn(
                                                "absolute top-0 left-0 h-full transition-all duration-500",
                                                "bg-gradient-to-r from-primary to-primary/60"
                                            )}
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: index < currentStep ? "100%" : "0%"
                                            }}
                                            transition={{ duration: 0.5, ease: "easeInOut" }}
                                        />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Progress Bar */}
                <div className="mt-6 h-2 bg-muted rounded-full overflow-hidden shadow-inner">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary to-primary/70 relative overflow-hidden"
                        initial={{ width: 0 }}
                        animate={{
                            width: `${((currentStep + 1) / steps.length) * 100}%`
                        }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{
                                x: ["-100%", "100%"]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        />
                    </motion.div>
                </div>

                {/* Step Counter */}
                <motion.div
                    className="mt-4 text-center"
                    key={currentStep}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <p className="text-sm font-medium text-primary">
                        Step {currentStep + 1} of {steps.length}
                    </p>
                </motion.div>
            </div>

            {/* Form Content */}
            <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="relative"
            >
                {children}
            </motion.div>
        </div>
    );
}

interface StepNavigationProps {
    currentStep: number;
    totalSteps: number;
    onPrevious?: () => void;
    onNext?: () => void;
    onSubmit?: () => void;
    isNextDisabled?: boolean;
    isPreviousDisabled?: boolean;
    isSubmitting?: boolean;
    isValid?: boolean;
    submitLabel?: string;
    previousLabel?: string;
    nextLabel?: string;
    hasUnsavedChanges?: boolean;
}

export function StepNavigation({
    currentStep,
    totalSteps,
    onPrevious,
    onNext,
    onSubmit,
    isNextDisabled = false,
    isPreviousDisabled = false,
    isSubmitting = false,
    isValid = true,
    submitLabel = "Submit",
    previousLabel = "Previous",
    nextLabel = "Next",
    hasUnsavedChanges = false
}: StepNavigationProps) {
    const isLastStep = currentStep === totalSteps - 1;
    const isFirstStep = currentStep === 0;

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Ctrl/Cmd + Enter to submit
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && isLastStep && isValid && !isSubmitting) {
                onSubmit?.();
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [isLastStep, isValid, isSubmitting, onSubmit]);

    return (
        <motion.div
            className="flex items-center justify-between mt-8 pt-6 border-t bg-gradient-to-r from-background via-muted/20 to-background -mx-6 px-6 pb-6 rounded-b-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
        >
            <div className="flex items-center gap-3">
                {hasUnsavedChanges && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full"
                    >
                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                        Unsaved changes
                    </motion.div>
                )}
                <div className="text-sm text-muted-foreground">
                    {isFirstStep ? "Start" : isLastStep ? "Final step" : `${currentStep + 1}/${totalSteps}`}
                </div>
            </div>

            <div className="flex gap-3">
                {!isFirstStep && (
                    <motion.button
                        type="button"
                        onClick={onPrevious}
                        disabled={isPreviousDisabled || isSubmitting}
                        className={cn(
                            "px-6 py-2.5 rounded-lg font-medium transition-all duration-200",
                            "border border-input bg-background hover:bg-accent hover:scale-105",
                            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                            "flex items-center gap-2"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                        {previousLabel}
                    </motion.button>
                )}

                {!isLastStep ? (
                    <motion.button
                        type="button"
                        onClick={onNext}
                        disabled={isNextDisabled || isSubmitting || !isValid}
                        className={cn(
                            "px-6 py-2.5 rounded-lg font-medium transition-all duration-200",
                            "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30",
                            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                            "flex items-center gap-2"
                        )}
                        whileHover={{ scale: isValid && !isNextDisabled && !isSubmitting ? 1.02 : 1 }}
                        whileTap={{ scale: isValid && !isNextDisabled && !isSubmitting ? 0.98 : 1 }}
                    >
                        {nextLabel}
                        <ChevronRight className="w-4 h-4" />
                    </motion.button>
                ) : (
                    <motion.button
                        type="submit"
                        onClick={onSubmit}
                        disabled={isSubmitting || !isValid}
                        className={cn(
                            "px-8 py-2.5 rounded-lg font-medium transition-all duration-200",
                            "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground",
                            "hover:shadow-xl hover:shadow-primary/40 hover:scale-105",
                            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                            "flex items-center gap-2"
                        )}
                        whileHover={{ scale: isValid && !isSubmitting ? 1.02 : 1 }}
                        whileTap={{ scale: isValid && !isSubmitting ? 0.98 : 1 }}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                {submitLabel}
                            </>
                        )}
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
}
