<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstructorProfile extends Model
{
    use HasFactory;

    protected $table = 'instructor_profiles';

    protected $fillable = [
        'user_id',
        'specialization',
        'degree',
        'workplace',
        'experience_years',
        'bio',
        'certificate_url',
        'sample_exam_url',
        'verify_status',
        'verified_by',
        'verified_at',
        'reject_reason',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'instructor_subjects', 'instructor_id', 'subject_id');
    }

    public function collaborators()
    {
        return $this->hasMany(Collaborator::class, 'owner_instructor_id');
    }
}
