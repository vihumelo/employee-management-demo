import logging

APP_LOGGER_NAME = "app"


def configure_logging(level_name: str) -> None:
    level = logging.getLevelNamesMapping().get(level_name.upper())
    if level is None:
        raise ValueError(f"Invalid log level: {level_name}")

    logger = logging.getLogger(APP_LOGGER_NAME)
    logger.setLevel(level)
    logger.propagate = False

    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(
            logging.Formatter(
                fmt="%(asctime)s %(levelname)-5s [%(component)s] %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S",
            )
        )
        logger.addHandler(handler)


def get_logger(component: str) -> logging.LoggerAdapter[logging.Logger]:
    return logging.LoggerAdapter(
        logging.getLogger(APP_LOGGER_NAME), {"component": component}
    )
