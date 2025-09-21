import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'create') {
      return await createBackup();
    } else if (action === 'list') {
      return await listBackups();
    } else if (action === 'restore') {
      const { backupFile } = await request.json();
      return await restoreBackup(backupFile);
    } else {
      return NextResponse.json(
        { ok: false, error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json(
      { ok: false, error: 'Backup operation failed' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function createBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${timestamp}.db`;
    const backupDir = path.join(process.cwd(), 'backups');
    const backupPath = path.join(backupDir, backupFileName);
    const sourcePath = path.join(process.cwd(), 'prisma', 'dev.db');

    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Copy database file
    fs.copyFileSync(sourcePath, backupPath);

    // Get file stats
    const stats = fs.statSync(backupPath);
    const fileSize = (stats.size / 1024 / 1024).toFixed(2); // MB

    return NextResponse.json({
      ok: true,
      message: 'Backup created successfully',
      backup: {
        fileName: backupFileName,
        fileSize: `${fileSize} MB`,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Create backup error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}

async function listBackups() {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    
    if (!fs.existsSync(backupDir)) {
      return NextResponse.json({
        ok: true,
        backups: []
      });
    }

    const files = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.db'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          fileName: file,
          fileSize: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
          createdAt: stats.birthtime.toISOString()
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      ok: true,
      backups: files
    });
  } catch (error) {
    console.error('List backups error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to list backups' },
      { status: 500 }
    );
  }
}

async function restoreBackup(backupFile: string) {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    const backupPath = path.join(backupDir, backupFile);
    const targetPath = path.join(process.cwd(), 'prisma', 'dev.db');

    if (!fs.existsSync(backupPath)) {
      return NextResponse.json(
        { ok: false, error: 'Backup file not found' },
        { status: 404 }
      );
    }

    // Create a backup of current database before restore
    const currentBackup = `pre-restore-${Date.now()}.db`;
    const currentBackupPath = path.join(backupDir, currentBackup);
    
    if (fs.existsSync(targetPath)) {
      fs.copyFileSync(targetPath, currentBackupPath);
    }

    // Restore from backup
    fs.copyFileSync(backupPath, targetPath);

    return NextResponse.json({
      ok: true,
      message: 'Database restored successfully',
      restoredFrom: backupFile
    });
  } catch (error) {
    console.error('Restore backup error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to restore backup' },
      { status: 500 }
    );
  }
}
