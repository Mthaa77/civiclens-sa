// CivicLens SA — Tenders API Route

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const province = searchParams.get('province');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const where: Record<string, unknown> = {};

    if (province) where.province = province;
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { buyerName: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [tenders, total] = await Promise.all([
      db.tender.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { estimatedValue: 'desc' },
        include: { municipality: { select: { name: true, code: true, financialHealthScore: true } } },
      }),
      db.tender.count({ where }),
    ]);

    return NextResponse.json({
      data: tenders,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Tenders API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenders' },
      { status: 500 }
    );
  }
}
