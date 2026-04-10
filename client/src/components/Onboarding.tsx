"use client"
import { useEffect, useState } from 'react';
import { Joyride, STATUS, Step } from 'react-joyride';

const JoyrideAny = Joyride as any;

const Onboarding = () => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    // For testing/development, you might want to force this occasionally, but for production:
    if (!hasSeenOnboarding) {
      // Small timeout to allow the dashboard to mount and animate in
      setTimeout(() => {
        setRun(true);
      }, 1500);
    }
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
  };

  const resetOnboarding = () => {
    localStorage.removeItem('hasSeenOnboarding');
    setRun(true);
  };

  const steps: Step[] = [
    {
      target: 'body', // Centers on screen
      content: (
        <div className="text-left space-y-2">
          <h3 className="text-lg font-bold text-slate-800">Welcome to your dashboard</h3>
          <p className="text-slate-600 text-sm">Let us show you around your new workspace.</p>
        </div>
      ),
      placement: 'center',
      // @ts-expect-error - Beacon disabling
      disableBeacon: true,
    },
    {
      target: '.tour-step-overview',
      content: (
        <div className="text-left space-y-2">
          <h3 className="text-lg font-bold text-slate-800">Performance Metrics</h3>
          <p className="text-slate-600 text-sm">Track your business performance here. Monitor revenue, costs, and profit health natively.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.tour-step-actions',
      content: (
        <div className="text-left space-y-2">
          <h3 className="text-lg font-bold text-slate-800">Quick Actions</h3>
          <p className="text-slate-600 text-sm">Add your first transaction here. Upload invoices and we will organize them automatically.</p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '.tour-step-insights',
      content: (
        <div className="text-left space-y-2">
          <h3 className="text-lg font-bold text-slate-800">Insights</h3>
          <p className="text-slate-600 text-sm">Get personalized recommendations based on your business data.</p>
        </div>
      ),
      placement: 'top',
    }
  ];

  return (
    <>
      <JoyrideAny
        steps={steps}
        run={run}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#6366f1',
            textColor: '#1e293b',
            zIndex: 10000,
            overlayColor: 'rgba(10, 13, 20, 0.8)',
          },
          tooltip: {
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          buttonNext: {
            backgroundColor: '#4f46e5',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
          },
          buttonSkip: {
            color: '#64748b',
          }
        } as any}
      />
      {/* Hidden button allowing other components to trigger the replay flow if needed. */}
      {/* Note: the user asked for a replay option, we can expose this method global or just keep it simple. */}
      <button 
        id="replay-onboarding-btn" 
        style={{ display: 'none' }} 
        onClick={resetOnboarding}
      >
        Replay
      </button>
    </>
  );
};

export default Onboarding;
