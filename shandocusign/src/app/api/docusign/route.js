import { NextResponse } from 'next/server';
import { createSignatureRequest } from '../utils/jwtHelper';

export async function POST(request) {
    try {
        const { participants, signingType, file } = await request.json();

        if (!participants || !participants.length) {
            return NextResponse.json(
                { error: 'Participants are required' },
                { status: 400 }
            );
        }

        if (!['regular', 'notary'].includes(signingType)) {
            return NextResponse.json(
                { error: 'Invalid signing type' },
                { status: 400 }
            );
        }

        const base64Content = file.replace(/^data:application\/pdf;base64,/, '');
        const result = await createSignatureRequest({ participants, signingType, base64Content });

        return NextResponse.json({
            message: 'Signature request sent successfully',
            result,
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}