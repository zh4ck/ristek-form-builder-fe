import { useState, useEffect, useRef } from 'react';

export function useAutosave(
    data: any,
    formId: string,
    token: string | null,
    delay: number = 2000
) {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

    // Track the last successfully saved configuration strings locally to avoid infinite save loops
    const lastSavedDataRef = useRef<string>(JSON.stringify(data));
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!token || !formId) return;

        const currentDataString = JSON.stringify(data);

        // If the data hasn't structurally mutated against the ref, ignore.
        if (currentDataString === lastSavedDataRef.current) return;

        // Clear any pending timeouts to restart the "debounce" clock
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Set a new timeout counting down to the actual API trigger payload
        saveTimeoutRef.current = setTimeout(async () => {
            setIsSaving(true);

            try {
                const response = await fetch(`http://localhost:5000/api/forms/${formId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    // Send the full React Hook Form state up
                    body: currentDataString,
                });

                if (!response.ok) throw new Error('Autosave failed');

                // Update the ref so we don't save this exact baseline configuration repeatedly
                lastSavedDataRef.current = currentDataString;
                setLastSavedAt(new Date());
            } catch (error) {
                console.error('Error during autosave:', error);
            } finally {
                setIsSaving(false);
            }
        }, delay);

        // Cleanup: clear the timeout if the component unmounts or data mutates again incredibly fast
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [data, formId, token, delay]);

    return { isSaving, lastSavedAt };
}
