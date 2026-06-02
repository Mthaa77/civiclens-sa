// CivicLens SA — Municipalities API Route

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const province = searchParams.get('province');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const where: Record<string, unknown> = {};

    if (province) {
      where.province = province;
    }
    if (category) {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
      ];
    }

    const [municipalities, total] = await Promise.all([
      db.municipality.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { financialHealthScore: 'desc' },
      }),
      db.municipality.count({ where }),
    ]);

    return NextResponse.json({
      data: municipalities,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Municipalities API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch municipalities' },
      { status: 500 }
    );
  }
}
