import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || '24';

    // Call TimeAPI for accurate Colombia time
    const timeResponse = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=America/Bogota', {
      headers: {
        'User-Agent': 'AstroFlora-MCP-Server/1.0.0',
      },
    });

    if (!timeResponse.ok) {
      throw new Error(`TimeAPI error: ${timeResponse.status}`);
    }

    const timeData = await timeResponse.json();
    const colombiaDateTime = new Date(timeData.dateTime);

    const timeOnly = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: format === '12',
    }).format(colombiaDateTime);

    const dateOnly = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }).format(colombiaDateTime);

    const result = {
      success: true,
      data: {
        currentTime: timeOnly,
        timezone: `${timeData.timeZone} (COT)`,
        date: dateOnly,
        location: '🇨🇴 Colombia',
        format: format === '12' ? '12-hour' : '24-hour',
        source: 'TimeAPI',
        utcOffset: '-05:00',
        rawDateTime: timeData.dateTime,
      },
      message: `🕐 **Current Time in Colombia** 🇨🇴\n\n⏰ **Time:** ${timeOnly}\n📅 **Date:** ${dateOnly}\n🌍 **Timezone:** ${timeData.timeZone} (COT)\n📍 **Location:** Colombia\n🔧 **Format:** ${format === '12' ? '12-hour' : '24-hour'}\n🌐 **Source:** TimeAPI\n⚡ **UTC Offset:** -05:00`,
    };

    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Colombia Time API error:', error);

    // Fallback to browser time calculation
    const now = new Date();
    const format = new URL(request.url).searchParams.get('format') || '24';

    const timeOnly = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Bogota',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: format === '12',
    }).format(now);

    const dateOnly = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }).format(now);

    const result = {
      success: true,
      data: {
        currentTime: timeOnly,
        timezone: 'America/Bogota (COT)',
        date: dateOnly,
        location: '🇨🇴 Colombia',
        format: format === '12' ? '12-hour' : '24-hour',
        source: 'Browser Fallback',
        utcOffset: '-05:00',
        rawDateTime: now.toISOString(),
      },
      message: `🕐 **Current Time in Colombia** 🇨🇴 *(Fallback)*\n\n⏰ **Time:** ${timeOnly}\n📅 **Date:** ${dateOnly}\n🌍 **Timezone:** America/Bogota (COT)\n📍 **Location:** Colombia\n🔧 **Format:** ${format === '12' ? '12-hour' : '24-hour'}\n🌐 **Source:** Browser Fallback\n⚠️ **Note:** TimeAPI unavailable, using system time`,
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    return Response.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}