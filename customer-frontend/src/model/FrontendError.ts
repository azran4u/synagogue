export interface ErrorDto {
  synagogueId?: string;
  userId?: string;
  userEmail?: string;
  errorObject?: any;
  errorMessage: string;
  errorStack?: string;
  timestamp: number; // Unix timestamp in milliseconds
  url?: string;
  userAgent?: string;
  errorType: "javascript" | "react" | "promise" | "console";
  componentStack?: string;
}

export class FrontendError {
  public id?: string;
  public synagogueId?: string;
  public userId?: string;
  public userEmail?: string;
  public errorObject?: any;
  public errorMessage: string;
  public errorStack?: string;
  public timestamp: Date;
  public url?: string;
  public userAgent?: string;
  public errorType: "javascript" | "react" | "promise" | "console";
  public componentStack?: string;

  constructor(
    errorMessage: string,
    errorType: "javascript" | "react" | "promise" | "console",
    synagogueId?: string,
    userId?: string,
    userEmail?: string,
    errorObject?: any,
    errorStack?: string,
    timestamp?: Date,
    url?: string,
    userAgent?: string,
    componentStack?: string
  ) {
    this.errorMessage = errorMessage;
    this.errorType = errorType;
    this.synagogueId = synagogueId;
    this.userId = userId;
    this.userEmail = userEmail;
    this.errorObject = errorObject;
    this.errorStack = errorStack;
    this.timestamp = timestamp || new Date();
    this.url = url;
    this.userAgent = userAgent;
    this.componentStack = componentStack;
  }

  // Convert to DTO for Firebase storage
  toDto(): ErrorDto {
    return {
      synagogueId: this.synagogueId,
      userId: this.userId,
      userEmail: this.userEmail,
      errorObject: this.errorObject,
      errorMessage: this.errorMessage,
      errorStack: this.errorStack,
      timestamp: this.timestamp.getTime(),
      url: this.url,
      userAgent: this.userAgent,
      errorType: this.errorType,
      componentStack: this.componentStack,
    };
  }

  // Create from DTO from Firebase
  static fromDto(dto: ErrorDto, id: string): FrontendError {
    const error = new FrontendError(
      dto.errorMessage,
      dto.errorType,
      dto.synagogueId,
      dto.userId,
      dto.userEmail,
      dto.errorObject,
      dto.errorStack,
      new Date(dto.timestamp),
      dto.url,
      dto.userAgent,
      dto.componentStack
    );
    error.id = id;
    return error;
  }

  // Create a new FrontendError
  static create(
    errorMessage: string,
    errorType: "javascript" | "react" | "promise" | "console",
    options?: {
      synagogueId?: string;
      userId?: string;
      userEmail?: string;
      errorObject?: any;
      errorStack?: string;
      url?: string;
      userAgent?: string;
      componentStack?: string;
    }
  ): FrontendError {
    return new FrontendError(
      errorMessage,
      errorType,
      options?.synagogueId,
      options?.userId,
      options?.userEmail,
      options?.errorObject,
      options?.errorStack,
      new Date(),
      options?.url,
      options?.userAgent,
      options?.componentStack
    );
  }
}

// Mapper for the FrontendError entity
export const errorMapper = {
  fromDto: FrontendError.fromDto,
  toDto: (error: FrontendError) => error.toDto(),
};
