'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { UseFormRegister, Control, useFieldArray } from 'react-hook-form';
import { GripVertical, Trash2, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface QuestionCardProps {
    id: string; // The dnd-kit sortable boundary id bindings natively
    index: number;
    register: UseFormRegister<any>;
    control: Control<any>;
    onRemove: () => void;
    // This explicitly passes down the specific array block being rendered
    questionType: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
    id,
    index,
    register,
    control,
    onRemove,
    questionType,
}) => {
    // Bind standard `@dnd-kit` configurations
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
    };

    // Bind the internal nested "Options" array explicitly mapping to this specific Question Index
    const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
        control,
        name: `questions.${index}.options`,
    });

    const needsOptions = ['multiple_choice', 'dropdown', 'checkbox'].includes(questionType);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative bg-white border rounded-xl shadow-sm mb-6 transition-all group ${isDragging ? 'ring-2 ring-indigo-500 shadow-xl' : 'border-gray-200'
                }`}
        >
            {/* Draggable Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-0 left-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-gray-50 rounded-l-xl border-r border-gray-100 touch-none"
            >
                <GripVertical className="text-gray-400 w-5 h-5" />
            </div>

            <div className="pl-12 pr-6 py-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <Input
                            label="Question Title"
                            placeholder="What is your favorite color?"
                            {...register(`questions.${index}.text`)}
                            className="font-medium text-lg border-x-0 border-t-0 border-b-2 rounded-none focus-visible:ring-0 px-0 h-12"
                        />
                    </div>

                    <div className="sm:w-64 shrink-0 mt-6 sm:mt-0">
                        <select
                            {...register(`questions.${index}.type`)}
                            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-gray-700 text-sm font-medium appearance-none"
                        >
                            <option value="short_answer">Short Answer</option>
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="checkbox">Checkboxes</option>
                            <option value="dropdown">Dropdown</option>
                        </select>
                    </div>
                </div>

                {/* Dynamic Nested Options Renderings */}
                {needsOptions && (
                    <div className="mt-6 space-y-3 pl-2 border-l-2 border-indigo-100">
                        {optionFields.map((optField, optIndex) => (
                            <div key={optField.id} className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full border border-gray-300 shrink-0 ${questionType === 'checkbox' ? 'rounded-md' : ''
                                    }`}></div>
                                <input
                                    type="text"
                                    placeholder={`Option ${optIndex + 1}`}
                                    {...register(`questions.${index}.options.${optIndex}.text`)}
                                    className="flex-1 text-sm border-b border-dashed border-gray-300 focus:border-indigo-500 focus:outline-none bg-transparent py-1 group/opt"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeOption(optIndex)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <div className="pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-indigo-600 pl-0 hover:bg-transparent hover:text-indigo-700"
                                onClick={() => appendOption({ text: `Option ${optionFields.length + 1}` })}
                            >
                                <Plus className="w-4 h-4 mr-1" /> Add Option
                            </Button>
                        </div>
                    </div>
                )}

                <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-end gap-6 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer group/req">
                        <input
                            type="checkbox"
                            {...register(`questions.${index}.isRequired`)}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-gray-600 group-hover/req:text-gray-900 transition-colors font-medium">Required</span>
                    </label>

                    <div className="w-px h-6 bg-gray-200"></div>

                    <button
                        type="button"
                        onClick={onRemove}
                        className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                        title="Delete Question"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
