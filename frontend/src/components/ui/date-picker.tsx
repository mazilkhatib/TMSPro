"use client"

import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DatePickerProps {
    date?: Date
    onSelect: (date: Date | undefined) => void
    className?: string
    placeholder?: string
    disabled?: boolean
}

export function DatePicker({
    date,
    onSelect,
    className,
    placeholder = "Pick a date",
    disabled = false
}: DatePickerProps) {
    const [inputValue, setInputValue] = React.useState("")
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

    // Sync input value when date prop changes
    React.useEffect(() => {
        if (date) {
            setInputValue(format(date, "P")) // "P" format is locale-aware (e.g., 01/27/2026)
        } else {
            setInputValue("")
        }
    }, [date])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setInputValue(value)

        const parsedDate = parse(value, "P", new Date())

        if (isValid(parsedDate)) {
            onSelect(parsedDate)
        } else if (value === "") {
            onSelect(undefined)
        }
        // If invalid, we don't update the parent's date, but we keep the input value so user can fix it
    }

    const handleCalendarSelect = (selectedDate: Date | undefined) => {
        onSelect(selectedDate)
        setIsPopoverOpen(false) // Close popover on selection
    }

    return (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <div className={cn("relative", className)}>
                <Input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={cn(
                        "pl-10 h-10 w-full transition-all duration-300",
                        "hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10",
                        "bg-background/50 backdrop-blur-sm"
                    )}
                    onClick={() => setIsPopoverOpen(true)} // Open calendar when input is clicked
                />
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={disabled}
                        className="absolute left-0 top-0 h-10 w-10 text-muted-foreground hover:text-primary z-10"
                    >
                        <CalendarIcon className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
            </div>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleCalendarSelect}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}
