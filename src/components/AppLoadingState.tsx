import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface AppLoadingStateProps {
  loading: boolean;
  onRetry: () => void;
}

export function AppLoadingState({ loading, onRetry }: AppLoadingStateProps) {
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-3 h-8 w-64" />
            <Skeleton className="mt-2 h-4 w-96 max-w-full" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-5 h-9 w-16" />
                <Skeleton className="mt-2 h-4 w-40" />
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <Skeleton className="h-6 w-56" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-lg font-bold text-slate-900">No se pudo cargar el panel</h1>
        <p className="mt-2 text-sm text-slate-500">
          No pudimos cargar las citas o los servicios. Revisa tu conexión e inténtalo nuevamente.
        </p>
        <Button className="mt-6" onClick={onRetry}>
          Reintentar
        </Button>
      </div>
    </div>
  );
}
