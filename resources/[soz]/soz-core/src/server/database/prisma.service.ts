import { Once, OnceStep } from '@core/decorators/event';
import { Inject } from '@core/decorators/injectable';
import { Provider } from '@core/decorators/provider';
import { OnceLoader } from '@core/loader/once.loader';
import { Logger } from '@core/logger';
import { Prisma, PrismaClient } from '@prisma/client';
import path from 'path';

const resourcePath = typeof GetResourcePath === 'function' ? GetResourcePath(GetCurrentResourceName()) : '';
const isWindows = process.platform === 'win32';
const engineName = isWindows ? 'query-engine-windows.exe' : 'query-engine-linux-musl';
if (!process.env.PRISMA_QUERY_ENGINE_BINARY && resourcePath) {
    process.env.PRISMA_QUERY_ENGINE_BINARY = path.join(resourcePath, 'build', engineName);
}

@Provider()
export class PrismaService extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'error' | 'warn' | 'info'> {
    @Inject(OnceLoader)
    private onceLoader: OnceLoader;

    @Inject(Logger)
    private logger: Logger;
    constructor() {
        super({
            log: [
                { emit: 'event', level: 'warn' },
                { emit: 'event', level: 'error' },
                { emit: 'event', level: 'info' },
                { emit: 'event', level: 'query' },
            ],
            datasources: {
                db: {
                    url: GetConvar('mysql_connection_string', ''),
                },
            },
            ...({
                __internal: {
                    configOverride: (config: any) => ({
                        ...config,
                        dirname: resourcePath,
                        relativeEnvPaths: {
                            rootEnvPath: null,
                            schemaEnvPath: null,
                        },
                    }),
                },
            } as any),
        });

        this.$on('query', e => {
            if (e.duration >= 50) {
                this.logger.warn(`[Prisma] [slow query] [${e.duration}ms] ${e.query.trim()} ${e.params} `);
            } else {
                // this.logger.debug(`[Prisma] [${e.duration}ms] ${e.query.trim()} ${e.params}`);
            }
        });
        this.$on('error', e => this.logger.error(`[Prisma] [${e.target}] ${e.message}`));
        this.$on('warn', e => this.logger.warn(`[Prisma] [${e.target}] ${e.message}`));
        this.$on('info', e => this.logger.info(`[Prisma] [${e.target}] ${e.message}`));
    }

    @Once()
    async onStart() {
        await this.$connect();

        setTimeout(() => this.onceLoader.trigger(OnceStep.DatabaseConnected), 0);
    }

    @Once(OnceStep.Stop)
    async onStop() {
        await this.$disconnect();
    }
}
