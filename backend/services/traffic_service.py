def duration_to_seconds(duration):
    """
    Convert Google's duration string such as '120s'
    into seconds.
    """

    if not duration:
        return 0

    if isinstance(duration, str) and duration.endswith("s"):
        try:
            return float(duration[:-1])
        except ValueError:
            return 0

    return 0


def calculate_traffic(
    duration_seconds,
    static_duration_seconds
):
    """
    Calculate traffic delay and traffic level
    using Google's traffic-aware and static durations.
    """

    traffic_delay_seconds = max(
        duration_seconds - static_duration_seconds,
        0
    )

    traffic_delay_minutes = (
        traffic_delay_seconds / 60
    )

    if static_duration_seconds > 0:
        traffic_ratio = (
            traffic_delay_seconds
            / static_duration_seconds
        )
    else:
        traffic_ratio = 0

    if traffic_delay_minutes <= 2 and traffic_ratio < 0.10:
        traffic_level = "Low"

    elif traffic_delay_minutes <= 8 and traffic_ratio < 0.30:
        traffic_level = "Moderate"

    else:
        traffic_level = "Heavy"

    return {
        "traffic_delay_minutes": round(
            traffic_delay_minutes,
            1
        ),
        "traffic_ratio": round(
            traffic_ratio,
            3
        ),
        "traffic_level": traffic_level
    }