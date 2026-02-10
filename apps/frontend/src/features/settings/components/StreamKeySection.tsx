import { LuCopy, LuEye, LuEyeOff, LuRefreshCw } from 'react-icons/lu';
import { CopyButtonFeedback } from '../types/profileSettings.types';
import { SettingsSection } from './SettingsSection';

interface StreamKeySectionProps {
    streamKey: string;
    showStreamKey: boolean;
    copyButtonFeedback: CopyButtonFeedback;
    isStreamKeyLoading: boolean;
    isResettingKey: boolean;
    streamKeyError: string | null;
    onToggleVisibility: () => void;
    onCopy: () => void;
    onReset: () => void;
}

export const StreamKeySection = ({
    streamKey,
    showStreamKey,
    copyButtonFeedback,
    isStreamKeyLoading,
    isResettingKey,
    streamKeyError,
    onToggleVisibility,
    onCopy,
    onReset,
}: StreamKeySectionProps) => (
    <SettingsSection title="Stream Key">
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <input
                        type={showStreamKey ? 'text' : 'password'}
                        value={isStreamKeyLoading ? 'Loading...' : streamKey}
                        readOnly
                        className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg py-2.5 pl-4 pr-4 focus:outline-none text-zinc-900 dark:text-white text-sm"
                    />
                </div>

                <button
                    type="button"
                    onClick={onToggleVisibility}
                    disabled={isStreamKeyLoading}
                    className="p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={showStreamKey ? 'Hide stream key' : 'Show stream key'}
                    title={showStreamKey ? 'Hide stream key' : 'Show stream key'}
                >
                    {showStreamKey ? (
                        <LuEyeOff className="w-4 h-4" />
                    ) : (
                        <LuEye className="w-4 h-4" />
                    )}
                </button>

                <button
                    type="button"
                    onClick={onCopy}
                    disabled={isStreamKeyLoading}
                    className={`p-2.5 rounded-lg border text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                        copyButtonFeedback === 'success'
                            ? 'border-accent-500 text-accent-600 bg-accent-50 shadow-[0_0_0_3px_rgba(228,63,111,0.22)] dark:border-accent-500/70 dark:text-accent-300 dark:bg-accent-500/10'
                            : copyButtonFeedback === 'error'
                              ? 'border-red-500 text-red-600 bg-red-50 shadow-[0_0_0_3px_rgba(239,68,68,0.2)] dark:border-red-500/60 dark:text-red-300 dark:bg-red-500/10'
                              : 'border-zinc-300 dark:border-zinc-700'
                    }`}
                    aria-label="Copy stream key"
                    title="Copy stream key"
                >
                    <LuCopy className="w-4 h-4" />
                </button>

                <button
                    type="button"
                    onClick={onReset}
                    disabled={isStreamKeyLoading || isResettingKey}
                    className="p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Reset stream key"
                    title="Reset stream key"
                >
                    <LuRefreshCw
                        className={`w-4 h-4 ${isResettingKey ? 'animate-spin' : ''}`}
                    />
                </button>
            </div>

            {streamKeyError ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                    {streamKeyError}
                </p>
            ) : null}
        </div>
    </SettingsSection>
);
