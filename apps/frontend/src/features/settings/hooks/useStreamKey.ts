import { useEffect, useRef, useState } from 'react';
import { ProfileService } from '../services/profileService';
import { CopyButtonFeedback } from '../types/profileSettings.types';
import { extractSettingsErrorMessage } from '../utils/error';

interface UseStreamKeyParams {
    enabled: boolean;
}

const COPY_FEEDBACK_DURATION_MS = 1600;

export const useStreamKey = ({ enabled }: UseStreamKeyParams) => {
    const copyFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );

    const [streamKey, setStreamKey] = useState('');
    const [showStreamKey, setShowStreamKey] = useState(false);
    const [copyButtonFeedback, setCopyButtonFeedback] =
        useState<CopyButtonFeedback>(null);
    const [isStreamKeyLoading, setIsStreamKeyLoading] = useState(false);
    const [isResettingKey, setIsResettingKey] = useState(false);
    const [streamKeyError, setStreamKeyError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) return;

        let isMounted = true;
        setIsStreamKeyLoading(true);
        setStreamKeyError(null);

        void ProfileService.getStreamKey()
            .then(({ streamKey: currentStreamKey }) => {
                if (!isMounted) return;
                setStreamKey(currentStreamKey);
                setStreamKeyError(null);
            })
            .catch((error: unknown) => {
                if (!isMounted) return;
                setStreamKey('');
                setStreamKeyError(
                    extractSettingsErrorMessage(error, 'Unable to load stream key'),
                );
            })
            .finally(() => {
                if (!isMounted) return;
                setIsStreamKeyLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [enabled]);

    useEffect(
        () => () => {
            if (copyFeedbackTimerRef.current) {
                clearTimeout(copyFeedbackTimerRef.current);
            }
        },
        [],
    );

    const showCopyButtonFeedback = (feedback: Exclude<CopyButtonFeedback, null>) => {
        setCopyButtonFeedback(feedback);

        if (copyFeedbackTimerRef.current) {
            clearTimeout(copyFeedbackTimerRef.current);
        }

        copyFeedbackTimerRef.current = setTimeout(() => {
            setCopyButtonFeedback(null);
        }, COPY_FEEDBACK_DURATION_MS);
    };

    const handleCopyStreamKey = async () => {
        if (!streamKey) return;
        try {
            await navigator.clipboard.writeText(streamKey);
            showCopyButtonFeedback('success');
            setStreamKeyError(null);
        } catch {
            showCopyButtonFeedback('error');
            setStreamKeyError('Unable to copy stream key');
        }
    };

    const handleStreamKeyReset = async () => {
        if (isResettingKey) return;

        setIsResettingKey(true);
        setStreamKeyError(null);
        try {
            const { streamKey: nextKey } = await ProfileService.resetStreamKey();
            setStreamKey(nextKey);
            setShowStreamKey(false);
        } catch (error: unknown) {
            setStreamKeyError(
                extractSettingsErrorMessage(error, 'Unable to reset stream key'),
            );
        } finally {
            setIsResettingKey(false);
        }
    };

    return {
        streamKey,
        showStreamKey,
        copyButtonFeedback,
        isStreamKeyLoading,
        isResettingKey,
        streamKeyError,
        handleCopyStreamKey,
        handleStreamKeyReset,
        toggleStreamKeyVisibility: () =>
            setShowStreamKey((isVisible) => !isVisible),
    };
};
