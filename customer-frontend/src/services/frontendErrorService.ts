import { GenericService } from "./genericService";
import { FrontendError, ErrorDto, errorMapper } from "../model/FrontendError";

export class FrontendErrorService {
  private static instance: FrontendErrorService;
  private synagogueId: string | null = null;
  private userId: string | null = null;
  private userEmail: string | null = null;
  private errorService: GenericService<FrontendError, ErrorDto>;
  private isLoggingError: boolean = false; // Flag to prevent infinite loops
  private originalConsoleError: typeof console.error; // Store original console.error

  private constructor() {
    // Store the original console.error before overriding it
    this.originalConsoleError = console.error;

    // Initialize error service without synagogue ID since errors are global
    this.errorService = new GenericService<FrontendError, ErrorDto>(
      "frontendErrors",
      errorMapper
    );
    this.initializeGlobalHandlers();
    this.overrideConsoleError();
  }

  public static getInstance(): FrontendErrorService {
    if (!FrontendErrorService.instance) {
      FrontendErrorService.instance = new FrontendErrorService();
    }
    return FrontendErrorService.instance;
  }

  /**
   * Update user context for error tracking
   */
  public updateUserContext(
    synagogueId?: string,
    userId?: string,
    userEmail?: string
  ) {
    this.synagogueId = synagogueId || null;
    this.userId = userId || null;
    this.userEmail = userEmail || null;
  }

  /**
   * Log an error to Firebase
   */
  public async logError(
    error: Error | string,
    errorType: "javascript" | "react" | "promise" | "console" = "javascript",
    componentStack?: string
  ): Promise<void> {
    // Prevent infinite loops by checking if we're already logging an error
    if (this.isLoggingError) {
      return;
    }

    this.isLoggingError = true;

    try {
      const errorMessage = typeof error === "string" ? error : error.message;
      const errorStack = typeof error === "string" ? undefined : error.stack;

      const errorEntity = FrontendError.create(errorMessage, errorType, {
        synagogueId: this.synagogueId || undefined,
        userId: this.userId || undefined,
        userEmail: this.userEmail || undefined,
        errorObject:
          typeof error === "string"
            ? error
            : {
                name: error.name,
                message: error.message,
                stack: error.stack,
              },
        errorStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        componentStack,
      });

      await this.errorService.insert(errorEntity);
    } catch (loggingError) {
      // Use original console.error to avoid triggering our override
      // This prevents infinite loops when Firebase logging fails
      this.originalConsoleError.call(
        console,
        "Failed to log error to Firebase:",
        loggingError
      );
      this.originalConsoleError.call(console, "Original error:", error);
    } finally {
      this.isLoggingError = false;
    }
  }

  public async getAll(): Promise<FrontendError[]> {
    return this.errorService.getAll();
  }

  public async deleteById(id: string): Promise<void> {
    return this.errorService.deleteById(id);
  }

  /**
   * Initialize global error handlers
   */
  private initializeGlobalHandlers(): void {
    // Handle uncaught JavaScript errors
    window.addEventListener("error", event => {
      this.logError(event.error || event.message, "javascript");
    });

    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", event => {
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));
      this.logError(error, "promise");
    });
  }

  /**
   * Override console.error to capture all console errors
   */
  private overrideConsoleError(): void {
    console.error = (...args: any[]) => {
      // Call the original console.error first
      this.originalConsoleError.apply(console, args);

      // Log to Firebase
      const errorMessage = args
        .map(arg =>
          typeof arg === "object" ? JSON.stringify(arg) : String(arg)
        )
        .join(" ");

      this.logError(errorMessage, "console");
    };
  }

  /**
   * Log React component errors
   */
  public logReactError(error: Error, errorInfo: any): void {
    this.logError(error, "react", errorInfo.componentStack);
  }
}

// Export singleton instance
export const frontendErrorService = FrontendErrorService.getInstance();
