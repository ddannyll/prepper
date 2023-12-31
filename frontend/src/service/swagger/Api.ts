/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ApplicationCreateBody {
  /** @example "Looking for an engineer to join our team." */
  jobDescription: string;
  /** @example "SafetyCulture" */
  name: string;
  questions?: string[][];
}

export interface ApplicationCreateResponse {
  /** @example "2021-07-01T00:00:00.000Z" */
  createdAt?: string;
  /** @example "1337" */
  id?: string;
  /** @example "Looking for an engineer to join our team." */
  jobDescription: string;
  /** @example "SafetyCulture" */
  name: string;
}

export interface UserCredentials {
  /** @example "daniel321" */
  password: string;
  /** @example "daniel" */
  username: string;
}

export interface UserSigninResponse {
  access_token?: string;
  /** @example "1337" */
  id?: string;
}

export interface DbInnerApplication {
  createdAt?: string;
  id?: string;
  jobDescription?: string;
  name?: string;
  ownerId?: string;
  updatedAt?: string;
  url?: string;
}

export interface HandlersAnalysisRequest {
  answer?: string;
  question?: string;
}

export interface HandlersApplicationDeleteRequest {
  id?: string;
}

export interface HandlersApplicationQuestionResponse {
  questions?: HandlersQuestionType[];
}

export interface HandlersCoverLetterRequest {
  company?: string;
  education?: string;
  experience?: string;
  name?: string;
  position?: string;
  reasons?: string;
}

export interface HandlersCoverLetterResponse {
  coverLetter?: string;
}

export interface HandlersGeneratedQuestion {
  audioLink?: number[];
  questionPrompt?: string;
  tags?: string[];
}

export interface HandlersQuestionType {
  id?: string;
  tags?: string[];
}

export interface ServiceAnalysis {
  bad?: string[];
  good?: string[];
}

export interface ServiceVoice2TextResponse {
  text?: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== "string" ? JSON.stringify(input) : input),
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
            ? JSON.stringify(property)
            : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(`${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
      },
      signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
      body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title prepper API
 * @version 0.1
 * @contact
 *
 * Backend API sepcifications for prepper
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  ai = {
    /**
     * No description
     *
     * @tags ai
     * @name AnalyseCreate
     * @summary analyse an answer to a question
     * @request POST:/ai/analyse
     * @secure
     */
    analyseCreate: (QAPair: HandlersAnalysisRequest, params: RequestParams = {}) =>
      this.request<ServiceAnalysis, any>({
        path: `/ai/analyse`,
        method: "POST",
        body: QAPair,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Inputs include given name, education, position and company you are applying for, reasons to apply and previous experience
     *
     * @tags ai
     * @name CoverletterCreate
     * @summary creates personalised cover letter
     * @request POST:/ai/coverletter
     * @secure
     */
    coverletterCreate: (CoverLetterDetails: HandlersCoverLetterRequest, params: RequestParams = {}) =>
      this.request<HandlersCoverLetterResponse, any>({
        path: `/ai/coverletter`,
        method: "POST",
        body: CoverLetterDetails,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Produces an audio file reading out the given text
     *
     * @tags ai
     * @name Text2VoiceCreate
     * @summary converts text to voice
     * @request POST:/ai/text2voice
     * @secure
     */
    text2VoiceCreate: (params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/ai/text2voice`,
        method: "POST",
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description The API endpoint expects an audio file in audio/webm format to be provided in the request body as a blob.
     *
     * @tags ai
     * @name Voice2TextCreate
     * @summary convert voice to text
     * @request POST:/ai/voice2text
     * @secure
     */
    voice2TextCreate: (params: RequestParams = {}) =>
      this.request<ServiceVoice2TextResponse, any>({
        path: `/ai/voice2text`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  application = {
    /**
     * No description
     *
     * @tags application
     * @name ApplicationDelete
     * @summary Delete a user's application
     * @request DELETE:/application
     * @secure
     */
    applicationDelete: (ApplicationDeleteRequest: HandlersApplicationDeleteRequest, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/application`,
        method: "DELETE",
        body: ApplicationDeleteRequest,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags application
     * @name ApplicationIdQuestionsList
     * @summary Get an user's application question types
     * @request GET:/application/:applicationId/questions
     * @secure
     */
    applicationIdQuestionsList: (applicationId: string, params: RequestParams = {}) =>
      this.request<HandlersApplicationQuestionResponse, void>({
        path: `/application/${applicationId}/questions`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags application
     * @name ApplicationIdQuestionsGenerateList
     * @summary Use AI to generate questions based on questions tags in a specified application
     * @request GET:/application/:applicationId/questions/generate
     * @secure
     */
    applicationIdQuestionsGenerateList: (applicationId: string, params: RequestParams = {}) =>
      this.request<HandlersGeneratedQuestion[], void>({
        path: `/application/${applicationId}/questions/generate`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description an application has some properties
     *
     * @tags application
     * @name CreateCreate
     * @summary Create an application for the user
     * @request POST:/application/create
     * @secure
     */
    createCreate: (ApplicationCreateBody: ApplicationCreateBody, params: RequestParams = {}) =>
      this.request<ApplicationCreateResponse, void>({
        path: `/application/create`,
        method: "POST",
        body: ApplicationCreateBody,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags application
     * @name GetApplication
     * @summary Get user's applications
     * @request GET:/application/me
     * @secure
     */
    getApplication: (params: RequestParams = {}) =>
      this.request<DbInnerApplication[], void>({
        path: `/application/me`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  ping = {
    /**
     * No description
     *
     * @tags ping
     * @name PingList
     * @summary Ping the server
     * @request GET:/ping
     * @secure
     */
    pingList: (params: RequestParams = {}) =>
      this.request<string, any>({
        path: `/ping`,
        method: "GET",
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  user = {
    /**
     * No description
     *
     * @tags user
     * @name HealthcheckList
     * @summary Check if a user is signed in
     * @request GET:/user/healthcheck
     * @secure
     */
    healthcheckList: (params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/user/healthcheck`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags user
     * @name SigninCreate
     * @summary Sign a user
     * @request POST:/user/signin
     * @secure
     */
    signinCreate: (SignInBody: UserCredentials, params: RequestParams = {}) =>
      this.request<UserSigninResponse, void>({
        path: `/user/signin`,
        method: "POST",
        body: SignInBody,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags user
     * @name SignoutCreate
     * @summary Sign a user out of dancord
     * @request POST:/user/signout
     * @secure
     */
    signoutCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/user/signout`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description Insert description here
     *
     * @tags user
     * @name SignupCreate
     * @summary Sign a user up to dancord
     * @request POST:/user/signup
     * @secure
     */
    signupCreate: (SignUpBody: UserCredentials, params: RequestParams = {}) =>
      this.request<UserSigninResponse, any>({
        path: `/user/signup`,
        method: "POST",
        body: SignUpBody,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
